import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest — Android "Add to Home Screen" name/icons.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Little Ilmies",
    short_name: "Little Ilmies",
    description: "Islamic & educational e-books for young hearts.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#F0F5FA",
    icons: [
      { src: "/images/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/images/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
