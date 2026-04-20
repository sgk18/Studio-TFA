"use server";

import { requireAdminAccess } from "@/lib/security/adminRole";
import { startOfDay, endOfDay, startOfMonth, subMonths, format } from "date-fns";

export async function getDashboardStatsAction(dateRange?: { from: string; to: string }) {
  const { supabase } = await requireAdminAccess({ from: "/admin" });

  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const monthStart = startOfMonth(now).toISOString();

  // 1. KPI Fetches
  const [
    { data: todayOrders },
    { data: monthOrders },
    { count: totalProducts },
    { count: pendingOrders }
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd)
      .in("payment_status", ["captured", "authorized"]),
    supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", monthStart)
      .in("payment_status", ["captured", "authorized"]),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
  ]);

  const todayRevenue = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const monthRevenue = (monthOrders ?? []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // 2. Chart Data: Monthly Revenue (Last 12 Months)
  const twelveMonthsAgo = startOfMonth(subMonths(now, 11)).toISOString();
  const { data: chartDataRaw } = await supabase
    .from("orders")
    .select("created_at, total_amount, line_items")
    .gte("created_at", twelveMonthsAgo)
    .in("payment_status", ["captured", "authorized"])
    .order("created_at", { ascending: true });

  const monthlySeries = processMonthlyChart(chartDataRaw ?? []);
  const categorySeries = processCategoryChart(chartDataRaw ?? []);
  const topProductsSeries = processTopProductsChart(chartDataRaw ?? []);

  return {
    kpis: {
      todayRevenue,
      monthRevenue,
      totalProducts: totalProducts ?? 0,
      pendingOrders: pendingOrders ?? 0,
    },
    charts: {
      monthly: monthlySeries,
      categories: categorySeries,
      topProducts: topProductsSeries,
    }
  };
}

function processMonthlyChart(orders: any[]) {
  const monthBuckets = new Map<string, number>();
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = subMonths(now, i);
    const key = format(d, "MMM yy");
    monthBuckets.set(key, 0);
  }

  orders.forEach(o => {
    const key = format(new Date(o.created_at), "MMM yy");
    if (monthBuckets.has(key)) {
      monthBuckets.set(key, monthBuckets.get(key)! + Number(o.total_amount || 0));
    }
  });

  return {
    labels: Array.from(monthBuckets.keys()),
    data: Array.from(monthBuckets.values()),
  };
}

function processCategoryChart(orders: any[]) {
  const categoryBuckets = new Map<string, number>();

  orders.forEach(o => {
    const items = Array.isArray(o.line_items) ? o.line_items : [];
    items.forEach((item: any) => {
      const category = item.category || "Uncategorized";
      const total = Number(item.line_total || item.price * item.quantity || 0);
      categoryBuckets.set(category, (categoryBuckets.get(category) || 0) + total);
    });
  });

  return {
    labels: Array.from(categoryBuckets.keys()),
    data: Array.from(categoryBuckets.values()),
  };
}

function processTopProductsChart(orders: any[]) {
  const productBuckets = new Map<string, number>();

  orders.forEach(o => {
    const items = Array.isArray(o.line_items) ? o.line_items : [];
    items.forEach((item: any) => {
      const title = item.title || "Unknown Product";
      const total = Number(item.line_total || item.price * item.quantity || 0);
      productBuckets.set(title, (productBuckets.get(title) || 0) + total);
    });
  });

  const sorted = Array.from(productBuckets.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    labels: sorted.map(s => s[0]),
    data: sorted.map(s => s[1]),
  };
}
