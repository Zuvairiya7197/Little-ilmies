import { NextResponse, type NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, getB2Bucket, getB2Client, isB2Configured } from "@/lib/storage/b2Client";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { z } from "zod";

const MAX_PDF_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_PREVIEW_SIZE = 10 * 1024 * 1024; // 10MB per page
const MAX_RENTAL_PAGE_SIZE = 10 * 1024 * 1024; // 10MB per page

const requestSchema = z.object({
  kind: z.enum(["pdf", "preview", "rental"]),
  productId: z.string().min(1),
  key: z.string().min(1),
  contentType: z.string().min(1),
  fileSize: z.number().int().min(0),
});

/**
 * Issues a presigned PUT URL for a direct browser-to-B2 upload — the
 * admin's browser uploads the file bytes straight to B2, bypassing this
 * Next.js server, same reasoning as the old Vercel Blob flow (keeps
 * large PDF/rental-page uploads off the serverless function's payload
 * limits). Every constraint the old Vercel-token flow enforced
 * server-side (admin auth, product exists, path matches the declared
 * kind, content type, max size) is re-checked here before signing.
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    if (!isB2Configured()) {
      console.error(
        "Client upload failed: Backblaze B2 is not configured. Set B2_KEY_ID, B2_APP_KEY, " +
          "B2_ENDPOINT, and B2_BUCKET_NAME in this deployment's environment variables."
      );
      return NextResponse.json(
        { error: "File storage isn't configured for this deployment yet. Contact the site administrator." },
        { status: 503 }
      );
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
    }
    const { kind, productId, key, contentType, fileSize } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const isPdf = kind === "pdf";
    const isRental = kind === "rental";
    const validPath = isPdf
      ? key.startsWith(`pdfs/${productId}/`) && key.endsWith(".pdf")
      : isRental
        ? key.startsWith(`rentals/${productId}/`) && /\.(jpe?g|png|webp)$/i.test(key)
        : key.startsWith(`previews/${productId}/`) && /\.(jpe?g|png|webp)$/i.test(key);
    if (!validPath) {
      return NextResponse.json({ error: "Invalid upload path." }, { status: 400 });
    }

    const allowedContentTypes = isPdf
      ? ["application/pdf"]
      : ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedContentTypes.includes(contentType)) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
    }

    const maximumSizeInBytes = isPdf ? MAX_PDF_SIZE : isRental ? MAX_RENTAL_PAGE_SIZE : MAX_PREVIEW_SIZE;
    if (fileSize > maximumSizeInBytes) {
      return NextResponse.json({ error: "File is too large." }, { status: 413 });
    }

    const command = new PutObjectCommand({
      Bucket: getB2Bucket(),
      Key: key,
      ContentType: contentType,
      ContentLength: fileSize,
    });
    const uploadUrl = await getSignedUrl(getB2Client(), command, { expiresIn: 300 });

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("Client upload setup failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Could not prepare upload: ${error.message}` : "Could not prepare upload." },
      { status: 500 }
    );
  }
}
