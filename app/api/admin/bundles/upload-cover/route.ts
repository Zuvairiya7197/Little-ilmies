import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { deleteCoverImage, saveCoverImage } from "@/lib/storage";
import { revalidateCatalogPaths } from "@/lib/catalog-revalidation";
import { bundleCoverUrl, isUploadedCoverPath } from "@/lib/catalog-assets";
import { z } from "zod";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];

// A cover the browser already compressed and uploaded straight to storage
// (lib/admin/upload-cover.ts), so only its path comes through here.
const attachedCoverSchema = z.object({ bundleId: z.string().min(1), pathname: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdminApi();
    if (denied) return denied;

    if (request.headers.get("content-type")?.includes("application/json")) {
      const parsed = attachedCoverSchema.safeParse(await request.json());
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid uploaded cover data" }, { status: 400 });
      }
      const { bundleId, pathname } = parsed.data;
      if (!isUploadedCoverPath(pathname, bundleId)) {
        return NextResponse.json({ error: "Invalid uploaded cover path" }, { status: 400 });
      }

      const bundle = await prisma.bundle.findUnique({
        where: { id: bundleId },
        select: { id: true, coverImage: true },
      });
      if (!bundle) {
        return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
      }

      await prisma.bundle.update({ where: { id: bundleId }, data: { coverImage: pathname } });
      if (bundle.coverImage && bundle.coverImage !== pathname) {
        await deleteCoverImage(bundle.coverImage);
      }
      revalidateCatalogPaths();
      return NextResponse.json({ coverImage: bundleCoverUrl(bundleId, pathname) });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const bundleId = formData.get("bundleId");

    if (!(file instanceof File) || typeof bundleId !== "string") {
      return NextResponse.json({ error: "Missing file or bundleId" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Please upload JPG, PNG, WebP, or SVG." },
        { status: 415 }
      );
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      select: { id: true, coverImage: true },
    });
    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle was saved, but the cover could not be attached because the bundle was not found." },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const relativePath = await saveCoverImage(buffer, file.name);

    await prisma.bundle.update({ where: { id: bundleId }, data: { coverImage: relativePath } });
    if (bundle.coverImage && bundle.coverImage !== relativePath) {
      await deleteCoverImage(bundle.coverImage);
    }
    revalidateCatalogPaths();

    return NextResponse.json({ coverImage: bundleCoverUrl(bundleId, relativePath) });
  } catch (error) {
    console.error("Bundle cover upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? `Cover upload failed: ${error.message}` : "Cover upload failed." },
      { status: 500 }
    );
  }
}

// Removes the uploaded image so the storefront goes back to showing the
// bundle's book covers.
export async function DELETE(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const bundleId = request.nextUrl.searchParams.get("bundleId");
  if (!bundleId) {
    return NextResponse.json({ error: "Missing bundleId" }, { status: 400 });
  }

  const bundle = await prisma.bundle.findUnique({ where: { id: bundleId }, select: { coverImage: true } });
  if (!bundle) {
    return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
  }

  await prisma.bundle.update({ where: { id: bundleId }, data: { coverImage: null } });
  if (bundle.coverImage) {
    await deleteCoverImage(bundle.coverImage);
  }
  revalidateCatalogPaths();
  return NextResponse.json({ status: "deleted" });
}
