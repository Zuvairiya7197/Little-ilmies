import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { savePrivatePdf, deletePrivatePdf } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { z } from "zod";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

// Which of the book's PDFs this request is for. Omitted = the colour PDF
// (the original single "main product PDF").
const pdfFormatSchema = z.enum(["COLOUR_PDF", "BW_PDF"]).default("COLOUR_PDF");

const attachedPdfSchema = z.object({
  productId: z.string().min(1),
  pathname: z.string().min(1),
  fileName: z.string().min(1).optional(),
  fileSize: z.number().int().min(0).optional(),
  format: pdfFormatSchema,
});
const removePdfSchema = z.object({ productId: z.string().min(1), format: pdfFormatSchema });

/** Product columns holding each format's PDF. */
function pdfFields(format: "COLOUR_PDF" | "BW_PDF", path: string | null, fileName: string | null, fileSize: number | null) {
  return format === "BW_PDF"
    ? { bwPrivatePdfPath: path, bwPdfFileName: fileName, bwPdfFileSize: fileSize }
    : { privatePdfPath: path, pdfFileName: fileName, pdfFileSize: fileSize };
}

/** True when the book's other PDF format points at the same file (e.g. a
 * colouring book whose B&W PDF reuses the colour file) — that file must
 * not be deleted when this format's PDF is replaced or removed. */
function sharedWithOtherFormat(
  product: { privatePdfPath: string | null; bwPrivatePdfPath: string | null },
  format: "COLOUR_PDF" | "BW_PDF",
  path: string
) {
  return currentPdfPath(product, format === "BW_PDF" ? "COLOUR_PDF" : "BW_PDF") === path;
}

function currentPdfPath(
  product: { privatePdfPath: string | null; bwPrivatePdfPath: string | null },
  format: "COLOUR_PDF" | "BW_PDF"
) {
  return format === "BW_PDF" ? product.bwPrivatePdfPath : product.privatePdfPath;
}

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

      const { productId, pathname, fileName, fileSize, format } = parsed.data;
      if (!pathname.startsWith(`pdfs/${productId}/`) || !pathname.endsWith(".pdf")) {
        return NextResponse.json({ error: "Invalid uploaded PDF path" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const previousPath = currentPdfPath(product, format);
      if (previousPath && previousPath !== pathname && !sharedWithOtherFormat(product, format, previousPath)) {
        await deletePrivatePdf(previousPath);
      }

      await prisma.product.update({
        where: { id: productId },
        data: pdfFields(format, pathname, fileName ?? pathname.split("/").at(-1) ?? null, fileSize ?? null),
      });
      revalidateCatalogPaths(product.slug);
      return NextResponse.json({ status: "uploaded" });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const productId = formData.get("productId");
    const format = formData.get("format") === "BW_PDF" ? "BW_PDF" : "COLOUR_PDF";

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

    const previousPath = currentPdfPath(product, format);
    if (previousPath && !sharedWithOtherFormat(product, format, previousPath)) {
      await deletePrivatePdf(previousPath);
    }

    await prisma.product.update({
      where: { id: productId },
      data: pdfFields(format, relativePath, file.name, file.size),
    });
    revalidateCatalogPaths(product.slug);

    return NextResponse.json({ status: "uploaded" });
  } catch (error) {
    console.error("PDF upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `PDF upload failed: ${error.message}` : "PDF upload failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    const parsed = removePdfSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const previousPath = currentPdfPath(product, parsed.data.format);
    if (previousPath && !sharedWithOtherFormat(product, parsed.data.format, previousPath)) {
      await deletePrivatePdf(previousPath);
    }
    await prisma.product.update({
      where: { id: product.id },
      data: pdfFields(parsed.data.format, null, null, null),
    });
    revalidateCatalogPaths(product.slug);
    return NextResponse.json({ status: "removed" });
  } catch (error) {
    console.error("PDF removal failed", error);
    return NextResponse.json({ error: "PDF removal failed." }, { status: 500 });
  }
}
