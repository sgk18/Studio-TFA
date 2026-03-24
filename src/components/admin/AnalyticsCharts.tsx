"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";
import { revenueData, bestSellersData, categoryData, BRAND_COLORS } from "@/lib/analyticsData";

// ─── Revenue Area Chart ──────────────────────────────────────────
const CustomRevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg shadow-lg px-4 py-3">
        <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-heading font-bold" style={{ color: BRAND_COLORS.rose }}>
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={BRAND_COLORS.rose} stopOpacity={0.35} />
            <stop offset="95%" stopColor={BRAND_COLORS.rose} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1eded" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomRevenueTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={BRAND_COLORS.rose}
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
          dot={{ fill: BRAND_COLORS.rose, r: 4, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6, fill: BRAND_COLORS.deep }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Best Sellers Bar Chart ──────────────────────────────────────
const CustomBarLabel = ({ x, y, width, value }: any) => (
  <text x={x + width + 8} y={y + 12} fill={BRAND_COLORS.olive} fontSize={11} fontWeight={700}>
    {value}
  </text>
);

export function BestSellersBarChart() {
  const colors = Object.values(BRAND_COLORS);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={bestSellersData} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1eded" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={160}
          tick={{ fontSize: 11, fontWeight: 600, fill: "#4B5563" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "#fdf0f3" }} formatter={(v) => [`${v} units sold`, "Quantity"]} />
        <Bar dataKey="qty" radius={[0, 6, 6, 0]} label={<CustomBarLabel />}>
          {bestSellersData.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Category Donut Chart ────────────────────────────────────────
const RADIAN = Math.PI / 180;
const DonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.07) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CategoryDonutChart({ totalOrders }: { totalOrders: number }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={<DonutLabel />}
        >
          {categoryData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <text x="50%" y="41%" textAnchor="middle" dominantBaseline="middle" fill="#9CA3AF" fontSize={10} fontWeight={700}>
          ORDERS
        </text>
        <text x="50%" y="49%" textAnchor="middle" dominantBaseline="middle" fill="#111827" fontSize={26} fontWeight={800}>
          {totalOrders}
        </text>
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>{value}</span>}
        />
        <Tooltip formatter={(v) => [`${v} orders`, ""]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
