"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";

export function CartSync() {
  const { items } = useCart();
  const supabase = createClient();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function syncCart() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) return;

      // If cart is empty, we might want to clear the abandoned cart entry or just leave it
      // The requirement is to save {user_id, items, updated_at}
      
      const { error } = await supabase
        .from("abandoned_carts")
        .upsert({
          user_id: user.id,
          items: items,
          updated_at: new Date().toISOString(),
          email_sent: false, // Reset sent flag if they update the cart
        }, {
          onConflict: "user_id"
        });

      if (error) {
        console.error("[CartSync] Failed to sync abandoned cart:", error);
      }
    }

    // Debounce sync to avoid spamming the database on every item add/remove
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      syncCart();
    }, 5000); // Sync after 5 seconds of inactivity

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, supabase]);

  return null;
}
