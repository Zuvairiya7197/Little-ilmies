import { NextResponse, type NextRequest } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

const MAX_PDF_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_PREVIEW_SIZE = 10 * 1024 * 1024; // 10MB per page

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HandleUploadPresignedBody;

    if (body.type === "blob.upload-completed") {
      return NextResponse.json({ response: "ok" });
    }

    const denied = await requireAdminApi();
    if (denied) return denied;

    const response = await handleUploadPresigned({
      request,
      body,
      getSignedToken: async (pathname, clientPayload) => {
        const payload = clientPayload ? JSON.parse(clientPayload) : null;
        if (
          (payload?.kind !== "pdf" && payload?.kind !== "preview") ||
          typeof payload.productId !== "string"
        ) {
          throw new Error("Invalid upload payload.");
        }

        const product = await prisma.product.findUnique({
          where: { id: payload.productId },
          select: { id: true },
        });
        if (!product) {
          throw new Error("Product not found.");
        }

        const isPdf = payload.kind === "pdf";
        const validPath = isPdf
          ? pathname.startsWith(`pdfs/${payload.productId}/`) && pathname.endsWith(".pdf")
          : pathname.startsWith(`previews/${payload.productId}/`) &&
            /\.(jpe?g|png|webp)$/i.test(pathname);
        if (!validPath) {
          throw new Error("Invalid upload path.");
        }

        const validUntil = Date.now() + 60 * 60 * 1000;
        const allowedContentTypes = isPdf
          ? ["application/pdf"]
          : ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const maximumSizeInBytes = isPdf ? MAX_PDF_SIZE : MAX_PREVIEW_SIZE;

        return {
          token: await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes,
            maximumSizeInBytes,
            validUntil,
          }),
          urlOptions: {
            allowedContentTypes,
            maximumSizeInBytes,
            validUntil,
            addRandomSuffix: false,
            tokenPayload: clientPayload,
          },
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Client PDF upload setup failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Could not prepare PDF upload: ${error.message}` : "Could not prepare PDF upload." },
      { status: 400 }
    );
  }
}
