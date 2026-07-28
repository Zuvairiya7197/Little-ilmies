import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { savePrivatePdf, deletePrivatePdf } from "@/lib/storage";
import { z } from "zod";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

const attachedPdfSchema = z.object({
  productId: z.string().min(1),
  pathname: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const parsed = attachedPdfSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid uploaded PDF data" }, { status: 400 });
      }

      const { productId, pathname } = parsed.data;
      if (!pathname.startsWith(`pdfs/${productId}/`) || !pathname.endsWith(".pdf")) {
        return NextResponse.json({ error: "Invalid uploaded PDF path" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      if (product.privatePdfPath && product.privatePdfPath !== pathname) {
        await deletePrivatePdf(product.privatePdfPath);
      }

      await prisma.product.update({ where: { id: productId }, data: { privatePdfPath: pathname } });
      return NextResponse.json({ status: "uploaded" });
    }

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

    if (product.privatePdfPath) {
      await deletePrivatePdf(product.privatePdfPath);
    }

    await prisma.product.update({ where: { id: productId }, data: { privatePdfPath: relativePath } });

    return NextResponse.json({ status: "uploaded" });
  } catch (error) {
    console.error("PDF upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `PDF upload failed: ${error.message}` : "PDF upload failed." },
      { status: 500 }
    );
  }
}
