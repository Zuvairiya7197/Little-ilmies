import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categories } from "../data/categories";
import { products } from "../data/products";
import { bundles } from "../data/bundles";

const prisma = new PrismaClient();

async function main() {
  const allowedCategorySlugs = categories.map((category) => category.slug);
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@littleilmies.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Little Ilmies Admin",
      role: "ADMIN",
      emailVerified: new Date(),
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });
  console.log(`Seeded admin user: ${adminEmail} / ${adminPassword}`);

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, coverImage: category.coverImage },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        coverImage: category.coverImage,
      },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  for (const product of products) {
    const dbCategory = await prisma.category.findUnique({
      where: { slug: product.category.slug },
    });
    const extraCategorySlugs = [
      ...(product.isBestseller ? ["best-sellers"] : []),
      ...(product.isNewArrival ? ["new-arrivals"] : []),
    ];
    const extraCategories = extraCategorySlugs.length
      ? await prisma.category.findMany({ where: { slug: { in: extraCategorySlugs } }, select: { id: true } })
      : [];

    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        slug: product.slug,
        title: product.title,
        description: product.shortDescription,
        shortDescription: product.shortDescription,
        coverImage: product.coverImage,
        previewImagePaths: [],
        ageRange: product.ageRange,
        language: product.language,
        format: product.format,
        pageCount: product.pageCount,
        rating: product.rating,
        reviewCount: product.reviewCount,
        downloadCount: product.downloadCount,
        isBestseller: product.isBestseller ?? false,
        isNewArrival: product.isNewArrival ?? false,
        hasFreePreview: product.hasFreePreview,
        status: "PUBLISHED",
        publishedAt: new Date(product.publishedAt),
      },
    });

    const categoryIds = [
      ...(dbCategory ? [dbCategory.id] : []),
      ...extraCategories.map((category) => category.id),
    ];
    await prisma.productCategory.deleteMany({ where: { productId: created.id } });
    if (categoryIds.length > 0) {
      await prisma.productCategory.createMany({
        data: categoryIds.map((categoryId) => ({ productId: created.id, categoryId })),
        skipDuplicates: true,
      });
    }

    for (const price of product.prices) {
      await prisma.productPrice.upsert({
        where: { productId_currencyCode: { productId: created.id, currencyCode: price.currencyCode } },
        update: {
          regularPrice: price.regularPrice,
          salePrice: price.salePrice,
          isDefault: price.isDefault ?? false,
          isActive: price.isActive ?? true,
        },
        create: {
          productId: created.id,
          pricingRegion: price.currencyCode === "INR" ? "India" : "International",
          currencyCode: price.currencyCode,
          regularPrice: price.regularPrice,
          salePrice: price.salePrice,
          isDefault: price.isDefault ?? false,
          isActive: price.isActive ?? true,
        },
      });
    }
  }
  console.log(`Seeded ${products.length} products with regional prices.`);

  await prisma.category.deleteMany({
    where: { slug: { notIn: allowedCategorySlugs } },
  });
  console.log("Removed categories outside the primary shop category list.");

  for (const bundle of bundles) {
    const bundleProducts = await prisma.product.findMany({
      where: { slug: { in: bundle.productSlugs } },
      select: { id: true },
    });

    const created = await prisma.bundle.upsert({
      where: { slug: bundle.slug },
      update: {
        name: bundle.name,
        description: bundle.description,
        bundlePriceInr: bundle.bundlePriceInr,
        bundlePriceUsd: bundle.bundlePriceUsd,
      },
      create: {
        slug: bundle.slug,
        name: bundle.name,
        description: bundle.description,
        bundlePriceInr: bundle.bundlePriceInr,
        bundlePriceUsd: bundle.bundlePriceUsd,
      },
    });

    await prisma.bundleProduct.deleteMany({ where: { bundleId: created.id } });
    await prisma.bundleProduct.createMany({
      data: bundleProducts.map((p) => ({ bundleId: created.id, productId: p.id })),
      skipDuplicates: true,
    });
  }
  console.log(`Seeded ${bundles.length} bundles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
