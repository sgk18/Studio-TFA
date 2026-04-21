import { AdminPagination } from "@/components/admin/AdminPagination";
import { OrdersDataTable, type AdminOrderRow } from "@/components/admin/OrdersDataTable";
import { ADMIN_PAGE_SIZE, pageRange, parsePageParam, totalPages } from "@/lib/adminPagination";
import { requireAdminAccess } from "@/lib/security/adminRole";
import type { Database } from "@/lib/supabase/types";

export const metadata = {
  title: "Orders | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

type OrderRow = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  | "id"
  | "guest_email"
  | "status"
  | "payment_status"
  | "total_amount"
  | "currency"
  | "created_at"
  | "shipping_address"
  | "line_items"
  | "user_id"
  | "tracking_number"
>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ page: pageParam }, { supabase }] = await Promise.all([
    searchParams,
    requireAdminAccess({ from: "/admin/orders" }),
  ]);

  const currentPage = parsePageParam(pageParam);
  const { from, to } = pageRange(currentPage, ADMIN_PAGE_SIZE);

  const { data: ordersRaw, count } = await supabase
    .from("orders")
    .select(
      "id, guest_email, status, payment_status, total_amount, currency, created_at, shipping_address, line_items, user_id, tracking_number",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const orders: AdminOrderRow[] = ((ordersRaw as any[] ?? []) as OrderRow[]).map((order) => ({
    id: order.id,
    customerEmail: resolveCustomerEmail(order),
    status: order.status,
    paymentStatus: order.payment_status,
    totalAmount: Number(order.total_amount) || 0,
    currency: order.currency,
    createdAt: order.created_at,
    shippingAddress: order.shipping_address,
    lineItems: order.line_items,
    trackingNumber: order.tracking_number,
  }));

  const pages = totalPages(count ?? 0, ADMIN_PAGE_SIZE);

  return (
    <section className="glass-shell rounded-[1.5rem] p-5 md:p-7">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Order Operations</p>
        <h2 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">Orders</h2>
        <p className="mt-2 text-sm text-foreground/65">
          Server-paginated order records with printable invoice templates.
        </p>
      </header>

      <OrdersDataTable orders={orders} />

      <AdminPagination
        basePath="/admin/orders"
        currentPage={currentPage}
        totalPages={pages}
      />
    </section>
  );
}

function resolveCustomerEmail(order: OrderRow): string {
  if (order.guest_email && order.guest_email.trim().length > 0) {
    return order.guest_email;
  }

  if (typeof order.shipping_address === "object" && order.shipping_address !== null) {
    const addressRecord = order.shipping_address as Record<string, unknown>;
    const email = addressRecord.email;
    if (typeof email === "string" && email.trim().length > 0) {
      return email;
    }
  }

  if (order.user_id) {
    return `User ${order.user_id.slice(0, 8)}...`;
  }

  return "Unknown customer";
}
