import NextImage, { type ImageProps } from "next/image";

/**
 * next/image, except files under public/images are served as-is. Those
 * are pre-converted to WebP at roughly 2x their largest display size, so
 * sending them through Vercel's optimizer would only spend billed Image
 * Optimization transformations (re-run after every deploy) for no gain.
 * Uploaded covers and other sources still go through the optimizer.
 */
export default function Image(props: ImageProps) {
  const isStaticAsset = typeof props.src === "string" && props.src.startsWith("/images/");
  return <NextImage {...props} unoptimized={props.unoptimized ?? isStaticAsset} />;
}
