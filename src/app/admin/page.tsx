import { AdminRevenueChart } from "@/components/admin/AdminRevenueChart";
import { AdminDonutChart } from "@/components/admin/AdminDonutChart";
import { AdminBarChart } from "@/components/admin/AdminBarChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatINR } from "@/lib/currency";
import { getDashboardStatsAction } from "@/actions/adminStats";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ChartPie, ShoppingBag, TrendingUp, Package, CalendarDays, Download } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStatsAction();

  return (
    <ScrollReveal className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Editorial Performance
          </p>
          <h2 className="mt-2 font-heading text-5xl tracking-tight">Intelligence Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/45 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/72 transition-colors hover:border-primary hover:text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Export Intel
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-shell border-none bg-primary/[0.03]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary/40" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading tracking-tight">{formatINR(stats.kpis.todayRevenue)}</div>
            <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-widest">Real-time daily intake</p>
          </CardContent>
        </Card>

        <Card className="glass-shell border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Monthly Target</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground/40" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading tracking-tight">{formatINR(stats.kpis.monthRevenue)}</div>
            <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-widest">MTD Performance</p>
          </CardContent>
        </Card>

        <Card className="glass-shell border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Pending Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading tracking-tight">{stats.kpis.pendingOrders}</div>
            <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-widest">Action Required</p>
          </CardContent>
        </Card>

        <Card className="glass-shell border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest">Active Studio</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground/40" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading tracking-tight">{stats.kpis.totalProducts}</div>
            <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-widest">Catalog Visibility</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Sales Trend */}
        <Card className="glass-shell border-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em]">Revenue Velocity</CardTitle>
            <CardDescription className="text-xs">Gross sales value trend over the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminRevenueChart labels={stats.charts.monthly.labels} values={stats.charts.monthly.data} />
          </CardContent>
        </Card>

        {/* Category Share */}
        <Card className="glass-shell border-none">
          <CardHeader>
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em]">Curated Categories</CardTitle>
            <CardDescription className="text-xs">Revenue distribution across gallery categories.</CardDescription>
          </CardHeader>
          <CardContent className="flex h-[320px] items-center">
            <AdminDonutChart labels={stats.charts.categories.labels} values={stats.charts.categories.data} />
          </CardContent>
        </Card>

        {/* Top 5 Products */}
        <Card className="glass-shell border-none lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em]">Premier Collections</CardTitle>
            <CardDescription className="text-xs">Top 5 best-selling pieces by revenue contribution.</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <AdminBarChart labels={stats.charts.topProducts.labels} values={stats.charts.topProducts.data} />
          </CardContent>
        </Card>
      </div>
    </ScrollReveal>
  );
}
