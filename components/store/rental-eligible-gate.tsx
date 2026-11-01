"use client";

import { useRentalEligible } from "@/hooks/use-rental-eligible";

/** Shows children to Rent & Read visitors and fallback to everyone else,
 * rendering neither until the visitor's country is known. */
export function RentalEligibleGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const eligible = useRentalEligible();
  if (eligible === null) return null;
  return eligible ? children : fallback;
}
