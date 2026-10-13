/**
 * Little Ilmies file CDN — a Cloudflare Worker in front of the private
 * Backblaze B2 bucket. Keeps a copy of each file at Cloudflare's edge so
 * repeat requests don't count against B2's daily download allowance
 * (traffic from B2 to Cloudflare is also free — Bandwidth Alliance).
 *
 *  - covers/... and previews/...  are public (the shop shows them anyway).
 *  - pdfs/... (paid PDFs) and rentals/... (Rent & Read pages) are served
 *    ONLY for a link the site signed after its own login / purchase /
 *    active-rental checks (lib/storage/signed-assets.ts). Links expire
 *    within minutes; anything unsigned, expired or altered is refused
 *    before the cache or B2 is touched.
 *
 * Setup (Cloudflare dashboard → Workers & Pages → this Worker → Edit code,
 * paste this file; Settings → Variables and Secrets):
 *   B2_ENDPOINT            e.g. https://s3.us-east-005.backblazeb2.com
 *   B2_REGION              e.g. us-east-005
 *   B2_BUCKET_NAME         little-ilmies-files
 *   B2_KEY_ID              a READ-ONLY application key for that bucket   (secret)
 *   B2_APP_KEY             that key's secret                             (secret)
 *   ASSETS_SIGNING_SECRET  same value as on Vercel                      (secret)
 * Custom Domain: assets.littleilmies.com; on Vercel set
 * ASSETS_CDN_DOMAIN=assets.littleilmies.com (and ASSETS_SIGNING_SECRET).
 */

const PUBLIC_KEY = /^(covers|previews)\/[A-Za-z0-9._\-/]+$/;
const PRIVATE_KEY = /^(pdfs|rentals)\/.+$/;
const ONE_YEAR = 31536000;
const THIRTY_DAYS = 2592000;

const worker = {
  async fetch(request, env, ctx) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return plain("Method not allowed", 405);
    }

    const url = new URL(request.url);
    let key;
    try {
      key = decodeURIComponent(url.pathname.slice(1));
    } catch {
      return plain("Not found", 404);
    }
    if (key.split("/").includes("..")) return plain("Not found", 404);

    let clientHeaders;
    let edgeTtl;
    if (PUBLIC_KEY.test(key)) {
      clientHeaders = { "Cache-Control": `public, max-age=${ONE_YEAR}, immutable`, "Access-Control-Allow-Origin": "*" };
      edgeTtl = ONE_YEAR;
    } else if (PRIVATE_KEY.test(key)) {
      const download = url.searchParams.get("dl") ?? "";
      if (!(await isValidSignature(env, key, url.searchParams.get("exp"), download, url.searchParams.get("sig")))) {
        return plain("This link has expired. Please go back and try again.", 403);
      }
      clientHeaders = key.startsWith("pdfs/")
        ? {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${safeFileName(download) || "book.pdf"}"`,
            "Cache-Control": "private, no-store",
          }
        : {
            "Content-Disposition": "inline",
            // The link itself stays valid for a few minutes, so let the
            // reader's browser reuse the page when the renter flips back.
            "Cache-Control": "private, max-age=300",
            "X-Robots-Tag": "noindex, nofollow",
          };
      edgeTtl = THIRTY_DAYS;
    } else {
      return plain("Not found", 404);
    }

    const file = await fromCacheOrB2(env, ctx, url, key, edgeTtl);
    if (file instanceof Response) return file;

    const response = new Response(request.method === "HEAD" ? null : file.body, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "X-Content-Type-Options": "nosniff",
        ...clientHeaders,
      },
    });
    return response;
  },
};

export default worker;

/**
 * The file's bytes from Cloudflare's cache, or from B2 (then cached).
 * Keys are unique per upload (a new file always gets a new name), so a
 * cached copy never goes stale. Query strings never affect the cache key.
 * Only reached after the access checks above.
 */
async function fromCacheOrB2(env, ctx, url, key, edgeTtl) {
  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}/__cache/${encodeURIComponent(key)}`, { method: "GET" });
  const cached = await cache.match(cacheKey);
  if (cached) {
    return { body: cached.body, contentType: cached.headers.get("Content-Type") ?? "application/octet-stream" };
  }

  let upstream;
  try {
    upstream = await signedB2Get(env, key);
  } catch (error) {
    console.error("B2 request failed", error);
    return plain("Temporarily unavailable", 503, { "Retry-After": "300" });
  }

  if (!upstream.ok) {
    if (upstream.status === 404) return plain("Not found", 404);
    // Log B2's reason (e.g. a daily cap) without caching the failure.
    console.error(`B2 returned ${upstream.status} for ${key}: ${await upstream.text()}`);
    return plain("Temporarily unavailable", 503, { "Retry-After": "300" });
  }

  const contentType = upstream.headers.get("Content-Type") ?? "application/octet-stream";
  const [forClient, forCache] = upstream.body.tee();
  ctx.waitUntil(
    cache.put(
      cacheKey,
      new Response(forCache, {
        headers: { "Content-Type": contentType, "Cache-Control": `public, max-age=${edgeTtl}` },
      })
    )
  );
  return { body: forClient, contentType };
}

/** Same message and HMAC-SHA256 as lib/storage/signed-assets.ts. */
export async function isValidSignature(env, key, exp, download, sig) {
  const secret = env.ASSETS_SIGNING_SECRET;
  if (!secret || !exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;

  const expected = toHex(await hmac(new TextEncoder().encode(secret), `${key}\n${exp}\n${download}`));
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

function safeFileName(name) {
  return name.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 120);
}

function plain(body, status, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain", "Cache-Control": "no-store", ...extraHeaders },
  });
}

// ---------------------------------------------------------------------------
// Minimal AWS Signature V4 for a single S3 GET (B2's S3-compatible API).
// ---------------------------------------------------------------------------

export async function signedB2Get(env, key, now = new Date()) {
  const { url, headers } = await signS3Get({
    endpoint: env.B2_ENDPOINT,
    region: env.B2_REGION || "us-west-004",
    bucket: env.B2_BUCKET_NAME,
    key,
    accessKeyId: env.B2_KEY_ID,
    secretAccessKey: env.B2_APP_KEY,
    now,
  });
  return fetch(url, { headers });
}

export async function signS3Get({ endpoint, region, bucket, key, accessKeyId, secretAccessKey, now }) {
  const host = new URL(endpoint).host;
  const canonicalUri = `/${encodeSegment(bucket)}/${key.split("/").map(encodeSegment).join("/")}`;
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["GET", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");

  const scope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");

  let signingKey = await hmac(new TextEncoder().encode(`AWS4${secretAccessKey}`), dateStamp);
  signingKey = await hmac(signingKey, region);
  signingKey = await hmac(signingKey, "s3");
  signingKey = await hmac(signingKey, "aws4_request");
  const signature = toHex(await hmac(signingKey, stringToSign));

  return {
    url: `https://${host}${canonicalUri}`,
    headers: {
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  };
}

function encodeSegment(segment) {
  return encodeURIComponent(segment).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function hmac(keyBytes, message) {
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message)));
}

async function sha256Hex(message) {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message))));
}

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
