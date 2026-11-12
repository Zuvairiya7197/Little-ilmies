/**
 * One inbox, one identity: "Ali.Khan+eid@gmail.com" and "alikhan@gmail.com"
 * deliver to the same person, so coupon limits treat them as the same
 * customer. Strips "+tags" everywhere, and dots too for Gmail, which
 * ignores them.
 */
export function normalizeEmail(email: string) {
  const [rawLocal, rawDomain = ""] = email.trim().toLowerCase().split("@");
  const domain = rawDomain === "googlemail.com" ? "gmail.com" : rawDomain;
  let local = rawLocal.split("+")[0];
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}
