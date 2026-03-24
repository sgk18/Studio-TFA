import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  RevenueAreaChart,
  BestSellersBarChart,
  CategoryDonutChart,
} from "@/components/admin/AnalyticsCharts";
import { statCards, categoryData } from "@/lib/analyticsData";
import { TrendingUp, ShoppingBag, ReceiptText, Package } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Studio TFA Admin",
};

const statIcons = [TrendingUp, ShoppingBag, ReceiptText];
const totalOrders = categoryData.reduce((acc, c) => acc + c.value, 0);

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F5] pt-28 pb-20 px-6">
      <div className="container mx-auto max-w-7xl space-y-10">

        {/* ── Page Header ─────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-2">Admin Panel</p>
            <h1 className="font-heading text-5xl md:text-6xl tracking-tight">Analytics</h1>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border border-black px-5 py-3 rounded-full hover:bg-black hover:text-white transition-all duration-200 w-fit"
          >
            <Package className="w-4 h-4" />
            Manage Inventory
          </Link>
        </div>

        {/* ── Stat Summary Cards ───────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {statCards.map((stat, i) => {
            const Icon = statIcons[i];
            return (
              <Card key={stat.label} className="bg-white border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        {stat.label}
                      </p>
                      <p className="font-heading text-4xl font-bold tracking-tight">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#FDF0F3" }}>
                      <Icon className="w-5 h-5" style={{ color: "#D17484" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Revenue Area Chart (Full Width) ─────── */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Revenue Trends</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest font-bold">
              Total sales for the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart />
          </CardContent>
        </Card>

        {/* ── Bottom Grid: Best Sellers + Donut ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">Best Sellers</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold">
                Top 5 most ordered items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BestSellersBarChart />
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">By Category</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold">
                Sales distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryDonutChart totalOrders={totalOrders} />
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground tracking-widest uppercase pt-4 pb-2">
          ⚡ Analytics powered by sample data — connects to live Supabase orders once active.
        </p>

      </div>
    </div>
  );
}
