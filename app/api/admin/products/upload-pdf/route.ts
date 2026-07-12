import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { savePrivatePdf, deletePrivatePdf } from "@/lib/storage";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

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
    return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 413 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF" }, { status: 415 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const relativePath = await savePrivatePdf(buffer, file.name);

  // Replace, don't accumulate — an old PDF left on disk after a re-upload
  // is both wasted storage and a stale-file risk.
  if (product.privatePdfPath) {
    await deletePrivatePdf(product.privatePdfPath);
  }

  await prisma.product.update({ where: { id: productId }, data: { privatePdfPath: relativePath } });

  return NextResponse.json({ status: "uploaded" });
}
