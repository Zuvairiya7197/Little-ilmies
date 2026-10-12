/**
 * Little Ilmies public image CDN — a Cloudflare Worker.
 *
 * Serves ONLY book covers (covers/...) and free preview pages
 * (previews/...) from the private Backblaze B2 bucket, and caches each one
 * at Cloudflare's edge. Traffic from B2 to Cloudflare is free (Bandwidth
 * Alliance), and cached images never reach B2 at all, so storefront images
 * stop counting against B2's daily download allowance.
 *
 * Paid PDFs (pdfs/...) and Rent & Read pages (rentals/...) are refused —
 * they keep going through the site's own access-checked routes.
 *
 * Setup (Cloudflare dashboard → Workers & Pages → Create → Worker, paste
 * this file, then Settings → Variables and Secrets):
 *   B2_ENDPOINT     e.g. https://s3.us-west-004.backblazeb2.com  (same as on Vercel)
 *   B2_REGION       e.g. us-west-004                             (same as on Vercel)
 *   B2_BUCKET_NAME  little-ilmies-files
 *   B2_KEY_ID       a READ-ONLY application key for that bucket   (secret)
 *   B2_APP_KEY      that key's secret                             (secret)
 * Then add a Custom Domain such as assets.littleilmies.com and set
 * ASSETS_CDN_DOMAIN=assets.littleilmies.com on Vercel and redeploy.
 */

const ALLOWED_KEY = /^(covers|previews)\/[A-Za-z0-9._\-/]+$/;
const ONE_YEAR = 31536000;

export default {
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
    if (!ALLOWED_KEY.test(key) || key.split("/").includes("..")) {
      return plain("Not found", 404);
    }

    // Keys are unique per upload (a new file always gets a new name), so a
    // cached copy never goes stale. Query strings are ignored.
    const cache = caches.default;
    const cacheKey = new Request(`${url.origin}/${key}`, { method: "GET" });
    const cached = await cache.match(cacheKey);
    if (cached) return request.method === "HEAD" ? new Response(null, cached) : cached;

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

    const response = new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream",
        "Cache-Control": `public, max-age=${ONE_YEAR}, immutable`,
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return request.method === "HEAD" ? new Response(null, response) : response;
  },
};

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
