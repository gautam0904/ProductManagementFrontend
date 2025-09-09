import type { CartItem, AppliedOffer } from "../types/cart";
import type { OfferType, Product } from "../types/products";

/**
 * How discounts are computed per item:
 * - BOGO (Buy 1 Get 1 Free): floor(qty / 2) * price discount
 * - B2G1 (Buy 2 Get 1): floor(qty / 3) * price discount
 */

export function computeItemOffers(product: Product, quantity: number): AppliedOffer[] {
  if (!product.offer) return [];

  const unit = product.price;
  let discount = 0;
  let label = "";

  if (product.offer === "BOGO") {
    const free = Math.floor(quantity / 2);
    discount = free * unit;
    label = free > 0 ? `BOGO: ${free} free` : "BOGO";
  } else if (product.offer === "B2G1") {
    const free = Math.floor(quantity / 3);
    discount = free * unit;
    label = free > 0 ? `Buy 2 Get 1: ${free} free` : "Buy 2 Get 1";
  }
  return discount > 0 ? [{ type: product.offer, label, discount }] : [];
}

/** Suggest adding extras to trigger offer (for popups) */
export function getOfferSuggestion(product: Product, currentQty: number): { title: string; message: string; addQty: number } | null {
  const unit = product.price;
  if (product.offer === "BOGO") {
    if (currentQty === 1) {
      return {
        title: "BOGO offer",
        message: `Add 1 more to get one free and save ${unit.toFixed(2)}.`,
        addQty: 1,
      };
    }
  } else if (product.offer === "B2G1") {
    const mod = currentQty % 3;
    if (mod === 1) {
      return {
        title: "Buy 2 Get 1",
        message: `Add 1 more (total 2) and then 1 extra free at 3. Add 2 more for the free item now.`,
        addQty: 2,
      };
    }
    if (mod === 2) {
      return {
        title: "Buy 2 Get 1",
        message: `Add 1 more to get 1 free and save ${unit.toFixed(2)}.`,
        addQty: 1,
      };
    }
  }
  return null;
}

/** Recalculate cart totals on the client (optional preview) */
export function recomputeCart(items: { product: Product; quantity: number }[], currency: string) {
  const detailed: CartItem[] = items.map(({ product, quantity }) => {
    const appliedOffers = computeItemOffers(product, quantity);
    const discount = appliedOffers.reduce((s, o) => s + o.discount, 0);
    const lineTotal = product.price * quantity - discount;
    return { product, quantity, lineTotal, appliedOffers };
  });

  const subtotal = detailed.reduce((s, it) => s + it.product.price * it.quantity, 0);
  const discounts = detailed.reduce((s, it) => s + (it.appliedOffers?.reduce((a, o) => a + o.discount, 0) || 0), 0);
  const total = subtotal - discounts;

  return { items: detailed, subtotal, discounts, total, currency };
}
