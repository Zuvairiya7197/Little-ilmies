import {
  RENTAL_MINIMUM_PRICE,
  RENTAL_PERCENTAGE,
  RENTAL_ROUNDING_INCREMENT,
} from "@/lib/rentals/config";

export function calculateRentalPrice(salePrice: number) {
  const percentagePrice = (salePrice * RENTAL_PERCENTAGE) / 100;
  const roundedPrice =
    Math.ceil(percentagePrice / RENTAL_ROUNDING_INCREMENT) * RENTAL_ROUNDING_INCREMENT;

  return Math.max(RENTAL_MINIMUM_PRICE, roundedPrice);
}
