import { CustomOrdersKanban, type AdminCustomOrderCard } from "@/components/admin/CustomOrdersKanban";
import { requireAdminAccess } from "@/lib/security/adminRole";
import type { Database } from "@/lib/supabase/types";

export const metadata = {
  title: "Custom Orders | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

type CustomOrderRow = Pick<
  Database["public"]["Tables"]["custom_orders"]["Row"],
  | "id"
  | "full_name"
  | "email"
  | "vision"
  | "color_palette"
  | "palette_notes"
  | "reference_image_url"
  | "status"
  | "created_at"
>;

export default async function AdminCustomOrdersPage() {
  const { supabase } = await requireAdminAccess({ from: "/admin/custom-orders" });

  const { data: ordersRaw } = await supabase
    .from("custom_orders")
    .select(
      "id, full_name, email, vision, color_palette, palette_notes, reference_image_url, status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(260);

  const initialOrders: AdminCustomOrderCard[] = ((ordersRaw as any[] ?? []) as CustomOrderRow[]).map(
    (order) => ({
      id: order.id,
      fullName: order.full_name,
      email: order.email,
      vision: order.vision,
      colorPalette: Array.isArray(order.color_palette) ? order.color_palette : [],
      paletteNotes: order.palette_notes,
      referenceImageUrl: order.reference_image_url,
      status: order.status,
      createdAt: order.created_at,
    })
  );

  return (
    <section className="glass-shell rounded-[1.5rem] p-5 md:p-7">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Commission Operations</p>
        <h2 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">Custom Orders</h2>
        <p className="mt-2 text-sm text-foreground/65">
          Track studio commissions with a visual Kanban board from intake to shipment.
        </p>
      </header>

      <CustomOrdersKanban initialOrders={initialOrders} />
    </section>
  );
}
