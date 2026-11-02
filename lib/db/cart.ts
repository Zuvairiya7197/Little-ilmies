import { prisma } from "@/lib/db/prisma";

/**
 * Mirrors a signed-in buyer's browser cart into the Cart table, as the
 * distinct books in it. The browser (zustand, localStorage) stays the source
 * of truth for checkout — this copy only lets the admin see what buyers left
 * behind (/admin/abandoned). Books already saved keep their addedAt, so the
 * newest addedAt is when the buyer last added something.
 */
export async function saveCartSnapshot(userId: string, productIds: string[]) {
  const existing = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });
  const ids = existing.map((p) => p.id);

  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: { notIn: ids } } }),
    prisma.cartItem.createMany({
      data: ids.map((productId) => ({ cartId: cart.id, productId })),
      skipDuplicates: true,
    }),
  ]);
}
