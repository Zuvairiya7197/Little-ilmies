/** The country middleware.ts stored for this visitor. Browser only. */
export function readDetectedCountry() {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("li_detected_country="))
    ?.split("=")[1];
}
