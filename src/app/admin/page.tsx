import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR } from "@/lib/currency";
import { requireAdminAccess } from "@/lib/security/adminRole";
import type { Database } from "@/lib/supabase/types";

export const metadata = {
  title: "Dashboard | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdminAccess({ from: "/admin" });

  const [
    { count: activeProductsCount },
    { count: ordersCount },
    { count: pendingReturnsCount },
    { data: revenueRowsRaw },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("returns")
      .select("id", { count: "exact", head: true })
      .eq("status", "requested"),
    supabase
      .from("orders")
      .select("created_at, total_amount, status, payment_status")
      .order("created_at", { ascending: true })
      .limit(240),
  ]);

  const revenueRows =
    ((revenueRowsRaw ?? []) as Pick<
      Database["public"]["Tables"]["orders"]["Row"],
      "created_at" | "total_amount" | "status" | "payment_status"
    >[])
      .filter((row) => isRevenueOrder(row.status, row.payment_status))
      .map((row) => ({
        ...row,
        total_amount: Number(row.total_amount) || 0,
      }));

  const totalRevenue = revenueRows.reduce((sum, row) => sum + row.total_amount, 0);
  const averageOrderValue =
    revenueRows.length > 0 ? totalRevenue / revenueRows.length : 0;

  const chartSeries = buildRevenueSeries(revenueRows, 8);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
          Operations Summary
        </p>
        <h2 className="mt-2 font-heading text-5xl tracking-tight">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl tracking-tight">{formatINR(totalRevenue)}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Paid + fulfilled orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl tracking-tight">{ordersCount ?? 0}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Across all statuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl tracking-tight">{activeProductsCount ?? 0}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Visible in storefront
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-4xl tracking-tight">{pendingReturnsCount ?? 0}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Return requests to review
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Revenue Trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Average order value: {formatINR(averageOrderValue)}
          </p>
        </CardHeader>
        <CardContent>
          <AdminRevenueChart labels={chartSeries.labels} values={chartSeries.values} />
        </CardContent>
      </Card>
    </section>
  );
}

function isRevenueOrder(status: string, paymentStatus: string) {
  return (
    status === "paid" ||
    status === "fulfilled" ||
    paymentStatus === "authorized" ||
    paymentStatus === "captured"
  );
}

function buildRevenueSeries(
  orders: Array<{ created_at: string; total_amount: number }>,
  monthWindow: number
) {
  const now = new Date();
  const labels: string[] = [];
  const values: number[] = [];
  const monthBuckets = new Map<string, number>();

  for (let index = monthWindow - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    labels.push(
      date.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      })
    );
    monthBuckets.set(key, 0);
  }

  for (const order of orders) {
    const date = new Date(order.created_at);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthBuckets.has(key)) {
      continue;
    }

    monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + order.total_amount);
  }

  for (const value of monthBuckets.values()) {
    values.push(Math.round(value));
  }

  return { labels, values };
}
