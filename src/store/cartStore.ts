import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FREE_SHIPPING_THRESHOLD_INR } from "@/lib/commerce";

export const FREE_SHIPPING_TARGET_INR = FREE_SHIPPING_THRESHOLD_INR;

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
  quantity: number;
};

export type CartCheckoutItem = {
  productId: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getCount: () => number;
  getFreeShippingRemaining: (target?: number) => number;
  toCheckoutItems: () => CartCheckoutItem[];
};

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  const rounded = Math.floor(quantity);
  return rounded < 1 ? 1 : rounded;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

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

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

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
        })),
    }),
    {
      name: "studio-tfa-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const useCart = useCartStore;