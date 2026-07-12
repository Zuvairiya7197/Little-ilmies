import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { saveCoverImage } from "@/lib/storage";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file");
  const productId = formData.get("productId");

  if (!(file instanceof File) || typeof productId !== "string") {
    return NextResponse.json({ error: "Missing file or productId" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Cover images are shown publicly on product cards, so mirror the
  // private-storage copy into /public — this is the one asset type in
  // lib/storage that's intentionally also served statically.
  await saveCoverImage(buffer, file.name);

  const publicDir = path.join(process.cwd(), "public", "images", "products", "uploads");
  await mkdir(publicDir, { recursive: true });
  const ext = path.extname(file.name) || ".jpg";
  const publicFilename = `${productId}${ext}`;
  await writeFile(path.join(publicDir, publicFilename), buffer);
  const publicPath = `/images/products/uploads/${publicFilename}`;

  await prisma.product.update({ where: { id: productId }, data: { coverImage: publicPath } });

  return NextResponse.json({ coverImage: publicPath });
}
