import { NextResponse, type NextRequest } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB per page
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Sample preview pages are intentionally public (limited excerpts, not the
 * full book — see README security notes), so they're written straight to
 * /public rather than the private-only storage path used for full PDFs.
 */
export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const formData = await request.formData();
  const files = formData.getAll("files");
  const productId = formData.get("productId");

  if (files.length === 0 || typeof productId !== "string") {
    return NextResponse.json({ error: "Missing files or productId" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const publicDir = path.join(process.cwd(), "public", "images", "previews", productId);
  await mkdir(publicDir, { recursive: true });

  const paths: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!(file instanceof File)) continue;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Page ${i + 1} is too large (max 5MB)` }, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Page ${i + 1} has an unsupported image type` }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `page-${i + 1}.jpg`;
    await writeFile(path.join(publicDir, filename), buffer);
    paths.push(`/images/previews/${productId}/${filename}`);
  }

  await prisma.product.update({ where: { id: productId }, data: { previewImagePaths: paths } });

  return NextResponse.json({ previewImagePaths: paths });
}
