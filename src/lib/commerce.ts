export const FREE_SHIPPING_THRESHOLD_INR = 2500;
export const STANDARD_SHIPPING_FEE_INR = 120;
export const PREMIUM_GIFTING_FEE_INR = 50;

export const MAX_CART_LINE_QUANTITY = 20;

export const AUTOMATIC_DISCOUNT_THRESHOLD_INR = 5000;
export const AUTOMATIC_DISCOUNT_PERCENT = 10;

export function roundMoney(value: number): number {
	return Math.round(value * 100) / 100;
}

export function resolveDisplayPrice(basePrice: number): number {
	return roundMoney(basePrice);
}

export function totalCartQuantity(items: Array<{ quantity: number }>): number {
	return items.reduce((sum, item) => {
		const quantity = Number(item.quantity);
		return sum + (Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 0);
	}, 0);
}