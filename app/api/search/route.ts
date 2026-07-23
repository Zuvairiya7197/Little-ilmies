import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";

/** Lightweight title/category search for the header search bar — returns
 * just enough to render a result list and navigate on selection. */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { shortDescription: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { categories: { some: { category: { name: { contains: query, mode: "insensitive" } } } } },
      ],
    },
    select: { slug: true, title: true },
    take: 6,
    orderBy: { title: "asc" },
  });

  return NextResponse.json({
    results: products.map((p) => ({ slug: p.slug, title: p.title })),
  });
}
