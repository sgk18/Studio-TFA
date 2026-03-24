"use client";

import { useCart } from "@/store/useCart";

type Product = {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
};

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() =>
        addItem({
          id: product.id,
          title: product.title,
          price: Number(product.price),
          image_url: product.image_url,
          category: product.category,
        })
      }
      className="bg-foreground text-background px-14 py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary transition-colors duration-300 active:scale-95"
    >
      Add to Cart
    </button>
  );
}
