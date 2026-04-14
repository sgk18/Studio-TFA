import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  FREE_SHIPPING_THRESHOLD_INR,
  MAX_CART_LINE_QUANTITY,
} from "@/lib/commerce";

export const FREE_SHIPPING_TARGET_INR = FREE_SHIPPING_THRESHOLD_INR;

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
  quantity: number;
  customisations?: Record<string, string>;
};

export type CartCheckoutItem = {
  productId: string;
  quantity: number;
  customisations?: Record<string, string>;
};

export type AppliedCoupon = {
  code: string;
  type: "percent" | "flat";
  value: number;
  discountAmount: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  coupon: AppliedCoupon | null;
  isGift: boolean;
  giftMessage: string;

  // Item actions
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Drawer actions
  openCart: () => void;
  closeCart: () => void;

  // Coupon actions
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;

  // Gift actions
  toggleGift: () => void;
  setGiftMessage: (message: string) => void;

  // Computed
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getCount: () => number;
  getFreeShippingRemaining: (target?: number) => number;
  toCheckoutItems: () => CartCheckoutItem[];
};

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  const rounded = Math.floor(quantity);
  if (rounded < 1) return 1;
  return Math.min(rounded, MAX_CART_LINE_QUANTITY);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,
      isGift: false,
      giftMessage: "",

      addItem: (product, quantity = 1) =>
        set((state) => {
          const safeQuantity = normalizeQuantity(quantity);
          const existing = state.items.find((item) => item.id === product.id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + safeQuantity }
                  : item
              ),
              isOpen: true,
            };
          }

          return {
            items: [...state.items, { ...product, quantity: safeQuantity }],
            isOpen: true,
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === id
                ? { ...item, quantity: normalizeQuantity(quantity) }
                : item
            ),
          };
        }),

      clearCart: () => set({ items: [], coupon: null, isGift: false, giftMessage: "" }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      toggleGift: () => set((state) => ({ isGift: !state.isGift })),
      setGiftMessage: (message) => set({ giftMessage: message }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getDiscountAmount: () => get().coupon?.discountAmount ?? 0,

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },

      getCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getFreeShippingRemaining: (target = FREE_SHIPPING_TARGET_INR) => {
        const subtotal = get().getSubtotal();
        return Math.max(0, target - subtotal);
      },

      toCheckoutItems: () =>
        get().items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          ...(item.customisations ? { customisations: item.customisations } : {}),
        })),
    }),
    {
      name: "studio-tfa-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        isGift: state.isGift,
        giftMessage: state.giftMessage,
      }),
    }
  )
);

export const useCart = useCartStore;