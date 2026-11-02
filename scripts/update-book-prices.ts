/**
 * One-off update of the colour PDF regular prices for all 23 books. The
 * selling prices below become the sale prices: each regular price is set 20%
 * above them, which needs the book sale discount in admin at 16.67%.
 *
 * Previews by default and writes only with --apply:
 *   DATABASE_URL="..." npx tsx scripts/update-book-prices.ts
 *   DATABASE_URL="..." npx tsx scripts/update-book-prices.ts --apply
 */
import { PrismaClient } from "@prisma/client";
import { calculateSalePrice } from "../lib/pricing/automatic-pricing";
import type { CurrencyCode } from "../types/pricing";

const DISCOUNT_PERCENTAGE = 16.67;
const CURRENCIES: CurrencyCode[] = ["INR", "USD", "GBP", "AED"];

// Sold only as black & white PDFs, so these take the same prices in that format.
const BW_ONLY_SLUGS = new Set([
  "my-first-islamic-colouring-book",
  "fruits-colouring-book",
  "shapes-in-my-world-a-colouring-book",
  "my-little-world-of-vehicles",
  "created-by-allah-my-first-colouring-book",
]);

const BOOKS: [slug: string, inr: number, usd: number, gbp: number, aed: number][] = [
  ["progressive-phonics-beginner-book-1-short-vowel-a", 149, 2.99, 2.49, 11],
  ["progressive-phonics-beginner-book-2-short-vowel-e", 149, 2.99, 2.49, 11],
  ["progressive-phonics-beginner-book-3-short-vowel-i", 199, 3.99, 3.49, 15],
  ["progressive-phonics-beginner-book-4-short-vowel-o", 179, 3.49, 2.99, 13],
  ["progressive-phonics-beginner-book-5-short-vowel-u", 199, 3.99, 3.49, 15],
  ["my-first-islamic-colouring-book", 149, 2.99, 2.49, 11],
  ["fruits-colouring-book", 149, 2.99, 2.49, 11],
  ["the-three-men-and-the-cave", 399, 7.99, 6.49, 29],
  ["the-boy-the-monk-and-the-king", 349, 6.99, 5.99, 25],
  ["my-first-healthy-dinners", 249, 4.99, 3.99, 18],
  ["my-first-healthy-snacks", 249, 4.99, 3.99, 18],
  ["my-first-healthy-lunches", 299, 5.99, 4.99, 22],
  ["my-first-healthy-breakfasts", 299, 5.99, 4.99, 22],
  ["shapes-in-my-world-a-colouring-book", 149, 2.99, 2.49, 11],
  ["my-little-world-of-vehicles", 179, 3.49, 2.99, 13],
  ["created-by-allah-my-first-colouring-book", 149, 2.99, 2.49, 11],
  ["why-does-night-come", 249, 4.99, 3.99, 18],
  ["how-does-a-seed-grow", 249, 4.99, 3.99, 18],
  ["how-do-bees-make-honey", 249, 4.99, 3.99, 18],
  ["how-it-rains", 249, 4.99, 3.99, 18],
  ["123-learning-numbers-1-10", 199, 3.99, 3.49, 15],
  ["abc-learning", 229, 4.49, 3.99, 17],
  ["asma-ul-husna-99-names-of-allah", 399, 7.99, 6.49, 29],
];

/** 20% above the selling price, rounded up: to a whole rupee for INR. */
function regularPriceFor(sellingPrice: number, currencyCode: CurrencyCode) {
  const selling = Math.round(sellingPrice * 100);
  const regular = Math.ceil((selling * 12) / 10);
  return currencyCode === "INR" ? Math.ceil(regular / 100) * 100 : regular;
}

const format = (minorUnits: number) => (minorUnits / 100).toFixed(2);

async function main() {
  const apply = process.argv.includes("--apply");
  const prisma = new PrismaClient();
  const updates: { id: string; regularPrice: number }[] = [];
  const problems: string[] = [];

  for (const [slug, ...sellingPrices] of BOOKS) {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { title: true, prices: true },
    });
    if (!product) {
      problems.push(`${slug}: book not found`);
      continue;
    }
    console.log(`\n${product.title}`);

    for (const bookFormat of BW_ONLY_SLUGS.has(slug) ? ["COLOUR_PDF", "BW_PDF"] : ["COLOUR_PDF"]) {
      CURRENCIES.forEach((currencyCode, index) => {
        const row = product.prices.find(
          (price) => price.format === bookFormat && price.currencyCode === currencyCode
        );
        if (!row) {
          problems.push(`${slug}: no ${currencyCode} ${bookFormat} price`);
          return;
        }
        if (!row.isActive) problems.push(`${slug}: ${currencyCode} ${bookFormat} price is inactive`);
        if (row.saleStartDate || row.saleEndDate) {
          problems.push(`${slug}: ${currencyCode} ${bookFormat} has sale dates set`);
        }

        const regularPrice = regularPriceFor(sellingPrices[index], currencyCode);
        const salePrice = calculateSalePrice(regularPrice, DISCOUNT_PERCENTAGE, currencyCode);
        console.log(
          `  ${bookFormat} ${currencyCode}: regular ${format(row.regularPrice)} -> ${format(regularPrice)}, buyer pays ${format(salePrice)}`
        );
        updates.push({ id: row.id, regularPrice });
      });
    }
  }

  if (problems.length > 0) {
    console.log(`\nCheck these first:\n${problems.map((problem) => `- ${problem}`).join("\n")}`);
  }

  if (!apply) {
    console.log(`\nPreview only: ${updates.length} prices would change. Add --apply to write them.`);
  } else if (problems.some((problem) => problem.includes("not found") || problem.includes("no "))) {
    console.log("\nNothing written: fix the missing books or prices first.");
    process.exitCode = 1;
  } else {
    await prisma.$transaction(
      updates.map(({ id, regularPrice }) => prisma.productPrice.update({ where: { id }, data: { regularPrice } }))
    );
    console.log(`\nUpdated ${updates.length} prices. Now set the book sale discount to ${DISCOUNT_PERCENTAGE}% in admin.`);
  }

  await prisma.$disconnect();
}

main();
