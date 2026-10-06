/**
 * The visitor's country for pricing, checkout and rental eligibility.
 *
 * The site sits behind Cloudflare, so Vercel's own `x-vercel-ip-country`
 * geolocates the Cloudflare server that forwarded the request, not the
 * visitor — e.g. a buyer in Dubai could show up as GB. Cloudflare's
 * `cf-ipcountry` reflects the real visitor, but anyone can send that header
 * straight to the *.vercel.app URL, so it's only trusted when the request
 * actually reached Vercel from a Cloudflare IP (Vercel overwrites
 * `x-real-ip`, so that can't be spoofed). Otherwise, Vercel's header is used.
 *
 * Edge-safe: used from middleware as well as route handlers.
 */

type HeaderReader = { get(name: string): string | null };

// https://www.cloudflare.com/ips-v4 and /ips-v6 (rarely change).
const CLOUDFLARE_IPV4_RANGES = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
];

const CLOUDFLARE_IPV6_RANGES = [
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];

// Cloudflare uses these when it can't place the visitor (XX) or for Tor (T1).
const UNKNOWN_CLOUDFLARE_COUNTRIES = new Set(["XX", "T1"]);

function ipv4ToBigInt(ip: string): bigint | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = BigInt(0);
  for (const part of parts) {
    const n = Number(part);
    if (!/^\d{1,3}$/.test(part) || n > 255) return null;
    value = (value << BigInt(8)) + BigInt(n);
  }
  return value;
}

function ipv6ToBigInt(ip: string): bigint | null {
  const halves = ip.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;
  const groups = [...head, ...Array(missing).fill("0"), ...tail];
  let value = BigInt(0);
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/i.test(group)) return null;
    value = (value << BigInt(16)) + BigInt(parseInt(group, 16));
  }
  return value;
}

function isInRanges(ip: string, ranges: string[], bits: number, parse: (ip: string) => bigint | null) {
  const value = parse(ip);
  if (value === null) return false;
  return ranges.some((range) => {
    const [base, prefixText] = range.split("/");
    const baseValue = parse(base);
    if (baseValue === null) return false;
    const shift = BigInt(bits - Number(prefixText));
    return value >> shift === baseValue >> shift;
  });
}

export function isCloudflareIp(ip: string) {
  return ip.includes(":")
    ? isInRanges(ip, CLOUDFLARE_IPV6_RANGES, 128, ipv6ToBigInt)
    : isInRanges(ip, CLOUDFLARE_IPV4_RANGES, 32, ipv4ToBigInt);
}

export function getRequestCountry(headers: HeaderReader): string | null {
  const vercelCountry = headers.get("x-vercel-ip-country");
  const cloudflareCountry = headers.get("cf-ipcountry")?.toUpperCase();
  const connectingIp = headers.get("x-real-ip") ?? headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();

  if (
    cloudflareCountry &&
    !UNKNOWN_CLOUDFLARE_COUNTRIES.has(cloudflareCountry) &&
    (!vercelCountry || (connectingIp && isCloudflareIp(connectingIp)))
  ) {
    return cloudflareCountry;
  }

  return vercelCountry ?? null;
}
