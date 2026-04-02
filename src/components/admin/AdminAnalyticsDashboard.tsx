"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  Lock,
  MessageSquareText,
  Package,
  Star,
  Warehouse,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ProductAnalyticsRow = {
  id: string;
  title: string;
  category: string | null;
  price: number | string | null;
  stock_count: number | string | null;
  is_custom_order: boolean | null;
  created_at: string | null;
};

export type ReviewAnalyticsRow = {
  id: string;
  product_id: string | null;
  rating: number | string | null;
  comment: string | null;
  created_at: string | null;
  product_title: string;
  product_category: string;
};

const CHART_COLORS = ["#D17484", "#8B263E", "#E0AEBA", "#786825", "#292800"];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function numberFrom(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toMonthKey(dateValue: string | null): { key: string; label: string } | null {
  if (!dateValue) return null;

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");

  return {
    key: `${year}-${month}`,
    label: parsed.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
  };
}

function formatDate(dateValue: string | null): string {
  if (!dateValue) return "-";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStockStatus(product: ProductAnalyticsRow): "custom" | "out" | "low" | "in" {
  if (product.is_custom_order) return "custom";

  const stock = numberFrom(product.stock_count);
  if (stock <= 0) return "out";
  if (stock <= 3) return "low";
  return "in";
}

function csvCell(value: string | number | boolean | null | undefined): string {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll("\"", "\"\"")}"`;
}

export function AdminAnalyticsDashboard({
  products,
  reviews,
}: {
  products: ProductAnalyticsRow[];
  reviews: ReviewAnalyticsRow[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryMetric, setCategoryMetric] = useState<"count" | "stock" | "value">("count");
  const [onlyReviewed, setOnlyReviewed] = useState(false);

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value ?? "all");
  };

  const handleStockFilterChange = (value: string | null) => {
    setStockFilter(value ?? "all");
  };

  const handleCategoryMetricChange = (value: string | null) => {
    if (value === "count" || value === "stock" || value === "value") {
      setCategoryMetric(value);
      return;
    }

    setCategoryMetric("count");
  };

  const categories = useMemo(() => {
    return [
      "all",
      ...Array.from(
        new Set(
          products
            .map((product) => product.category?.trim())
            .filter((category): category is string => Boolean(category))
        )
      ).sort((a, b) => a.localeCompare(b)),
    ];
  }, [products]);

  const reviewedProductIds = useMemo(() => {
    return new Set(
      reviews
        .map((review) => review.product_id)
        .filter((productId): productId is string => Boolean(productId))
    );
  }, [reviews]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      const stockStatus = getStockStatus(product);
      if (stockFilter !== "all" && stockStatus !== stockFilter) {
        return false;
      }

      if (onlyReviewed && !reviewedProductIds.has(product.id)) {
        return false;
      }

      return true;
    });
  }, [products, selectedCategory, stockFilter, onlyReviewed, reviewedProductIds]);

  const filteredProductIds = useMemo(() => {
    return new Set(filteredProducts.map((product) => product.id));
  }, [filteredProducts]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (!review.product_id) return false;
      return filteredProductIds.has(review.product_id);
    });
  }, [reviews, filteredProductIds]);

  const stats = useMemo(() => {
    const productsCount = filteredProducts.length;
    const reviewCount = filteredReviews.length;
    const avgPrice =
      productsCount > 0
        ? filteredProducts.reduce((sum, product) => sum + numberFrom(product.price), 0) / productsCount
        : 0;
    const avgRating =
      reviewCount > 0
        ? filteredReviews.reduce((sum, review) => sum + numberFrom(review.rating), 0) / reviewCount
        : 0;

    const inventoryUnits = filteredProducts.reduce(
      (sum, product) => sum + Math.max(0, numberFrom(product.stock_count)),
      0
    );

    const estimatedInventoryValue = filteredProducts.reduce((sum, product) => {
      const price = numberFrom(product.price);
      const stock = Math.max(0, numberFrom(product.stock_count));
      return sum + price * stock;
    }, 0);

    return {
      productsCount,
      reviewCount,
      avgPrice,
      avgRating,
      inventoryUnits,
      estimatedInventoryValue,
    };
  }, [filteredProducts, filteredReviews]);

  const categorySeries = useMemo(() => {
    type CategoryBucket = {
      category: string;
      count: number;
      stock: number;
      value: number;
    };

    const buckets = new Map<string, CategoryBucket>();

    for (const product of filteredProducts) {
      const category = product.category || "Uncategorized";
      const current = buckets.get(category) || {
        category,
        count: 0,
        stock: 0,
        value: 0,
      };

      current.count += 1;
      current.stock += Math.max(0, numberFrom(product.stock_count));
      current.value += Math.max(0, numberFrom(product.stock_count)) * numberFrom(product.price);

      buckets.set(category, current);
    }

    return Array.from(buckets.values())
      .sort((a, b) => b[categoryMetric] - a[categoryMetric])
      .slice(0, 8);
  }, [filteredProducts, categoryMetric]);

  const ratingSeries = useMemo(() => {
    const ratings = [5, 4, 3, 2, 1].map((score) => ({
      label: `${score} star`,
      value: 0,
    }));

    for (const review of filteredReviews) {
      const rating = Math.round(numberFrom(review.rating));
      const slot = ratings.find((item) => item.label === `${rating} star`);
      if (slot) {
        slot.value += 1;
      }
    }

    return ratings;
  }, [filteredReviews]);

  const activitySeries = useMemo(() => {
    type ActivityBucket = {
      key: string;
      label: string;
      products: number;
      reviews: number;
    };

    const bucketMap = new Map<string, ActivityBucket>();

    for (const product of filteredProducts) {
      const monthMeta = toMonthKey(product.created_at);
      if (!monthMeta) continue;

      const existing = bucketMap.get(monthMeta.key) || {
        key: monthMeta.key,
        label: monthMeta.label,
        products: 0,
        reviews: 0,
      };

      existing.products += 1;
      bucketMap.set(monthMeta.key, existing);
    }

    for (const review of filteredReviews) {
      const monthMeta = toMonthKey(review.created_at);
      if (!monthMeta) continue;

      const existing = bucketMap.get(monthMeta.key) || {
        key: monthMeta.key,
        label: monthMeta.label,
        products: 0,
        reviews: 0,
      };

      existing.reviews += 1;
      bucketMap.set(monthMeta.key, existing);
    }

    return Array.from(bucketMap.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredProducts, filteredReviews]);

  const topReviewedProducts = useMemo(() => {
    type ReviewBucket = {
      productId: string;
      productTitle: string;
      category: string;
      count: number;
      totalRating: number;
    };

    const buckets = new Map<string, ReviewBucket>();

    for (const review of filteredReviews) {
      if (!review.product_id) continue;

      const existing = buckets.get(review.product_id) || {
        productId: review.product_id,
        productTitle: review.product_title,
        category: review.product_category,
        count: 0,
        totalRating: 0,
      };

      existing.count += 1;
      existing.totalRating += numberFrom(review.rating);
      buckets.set(review.product_id, existing);
    }

    return Array.from(buckets.values())
      .map((item) => ({
        ...item,
        averageRating: item.count > 0 ? item.totalRating / item.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredReviews]);

  const recentReviews = useMemo(() => {
    return [...filteredReviews]
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 8);
  }, [filteredReviews]);

  const handleExportCsv = () => {
    const headers = [
      "title",
      "category",
      "price",
      "stock_count",
      "stock_status",
      "is_custom_order",
      "created_at",
    ];

    const rows = filteredProducts.map((product) => [
      product.title,
      product.category || "Uncategorized",
      numberFrom(product.price),
      numberFrom(product.stock_count),
      getStockStatus(product),
      Boolean(product.is_custom_order),
      product.created_at || "",
    ]);

    const csv = [
      headers.map((cell) => csvCell(cell)).join(","),
      ...rows.map((row) => row.map((cell) => csvCell(cell)).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `admin-analytics-${Date.now()}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Admin Panel
            </p>
            <h1 className="font-heading text-4xl md:text-5xl tracking-tight">Live Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              Analyze live product and review performance, filter by category/stock state, and export data for external reporting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/products"
              className="action-pill-link"
            >
              <Package className="w-4 h-4" />
              Manage Inventory
            </Link>
            <Link
              href="/admin/access"
              className="action-pill-link"
            >
              <Lock className="w-4 h-4" />
              Access Control
            </Link>
            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="border-white/45">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Analysis Options</CardTitle>
            <CardDescription>
              Use filters and metric options to inspect your data from different angles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</p>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stock State</p>
                <Select value={stockFilter} onValueChange={handleStockFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All stock states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stock states</SelectItem>
                    <SelectItem value="in">In stock</SelectItem>
                    <SelectItem value="low">Low stock</SelectItem>
                    <SelectItem value="out">Out of stock</SelectItem>
                    <SelectItem value="custom">Custom order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category Metric</p>
                <Select value={categoryMetric} onValueChange={handleCategoryMetricChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Product count</SelectItem>
                    <SelectItem value="stock">Total stock units</SelectItem>
                    <SelectItem value="value">Inventory value</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Extra Option</p>
                <div className="h-8 rounded-md border px-3 flex items-center justify-between bg-background">
                  <span className="text-sm text-foreground/80">Only products with reviews</span>
                  <Switch checked={onlyReviewed} onCheckedChange={setOnlyReviewed} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="border-white/45">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Products</p>
                  <p className="font-heading text-4xl mt-1">{stats.productsCount}</p>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#FDF0F3] flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#D17484]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/45">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avg Price</p>
                  <p className="font-heading text-4xl mt-1">{currencyFormatter.format(stats.avgPrice)}</p>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#F2F5E7] flex items-center justify-center">
                  <Warehouse className="w-5 h-5 text-[#786825]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/45">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reviews</p>
                  <p className="font-heading text-4xl mt-1">{stats.reviewCount}</p>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#F0F4FD] flex items-center justify-center">
                  <MessageSquareText className="w-5 h-5 text-[#1D4ED8]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/45">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avg Rating</p>
                  <p className="font-heading text-4xl mt-1">
                    {stats.reviewCount > 0 ? stats.avgRating.toFixed(1) : "0.0"}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-full bg-[#FFF7E7] flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#C27A00]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border-white/45">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">Category Performance</CardTitle>
              <CardDescription>
                Top categories by {categoryMetric === "count" ? "product count" : categoryMetric === "stock" ? "stock units" : "inventory value"}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categorySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1eded" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      categoryMetric === "value"
                        ? `₹${Math.round(Number(value) / 1000)}k`
                        : `${Math.round(Number(value))}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => {
                      const numericValue = numberFrom(value);

                      if (categoryMetric === "value") {
                        return [currencyFormatter.format(numericValue), "Inventory value"];
                      }

                      if (categoryMetric === "stock") {
                        return [`${numericValue} units`, "Stock"];
                      }

                      return [`${numericValue} products`, "Count"];
                    }}
                  />
                  <Bar dataKey={categoryMetric} radius={[6, 6, 0, 0]}>
                    {categorySeries.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-white/45">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">Ratings Mix</CardTitle>
              <CardDescription>Distribution of ratings for filtered products.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={ratingSeries}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {ratingSeries.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${numberFrom(value)} review(s)`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="xl:col-span-3 border-white/45">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">Monthly Activity</CardTitle>
              <CardDescription>Products created vs reviews submitted by month.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activitySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1eded" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="products"
                    stroke="#D17484"
                    strokeWidth={2.5}
                    name="Products"
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reviews"
                    stroke="#786825"
                    strokeWidth={2.5}
                    name="Reviews"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="border-white/45">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">Extra Insights</CardTitle>
              <CardDescription>Useful quick numbers for planning and restocking.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Inventory units</span>
                <span className="font-bold">{stats.inventoryUnits}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Estimated inventory value</span>
                <span className="font-bold">{currencyFormatter.format(stats.estimatedInventoryValue)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Categories in view</span>
                <span className="font-bold">{categorySeries.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Products with custom pricing</span>
                <span className="font-bold">
                  {filteredProducts.filter((product) => product.is_custom_order).length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Products without reviews</span>
                <span className="font-bold">
                  {filteredProducts.filter((product) => !reviewedProductIds.has(product.id)).length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2 border-white/45">
            <CardHeader>
              <CardTitle className="font-heading text-2xl tracking-tight">Most Reviewed Products</CardTitle>
              <CardDescription>High-engagement products based on review volume.</CardDescription>
            </CardHeader>
            <CardContent>
              {topReviewedProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No review data found for current filters.</p>
              ) : (
                <div className="space-y-3">
                  {topReviewedProducts.map((item, index) => (
                    <div key={item.productId} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{index + 1}. {item.productTitle}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{item.count} reviews</p>
                        <p className="text-sm font-bold flex items-center justify-end gap-1">
                          <BarChart3 className="w-3.5 h-3.5" />
                          {item.averageRating.toFixed(1)} / 5
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/45">
          <CardHeader>
            <CardTitle className="font-heading text-2xl tracking-tight">Recent Reviews</CardTitle>
            <CardDescription>Latest feedback in the filtered scope.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent reviews available for current filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.product_title}</TableCell>
                        <TableCell className="text-xs uppercase tracking-widest text-muted-foreground">
                          {review.product_category}
                        </TableCell>
                        <TableCell>{numberFrom(review.rating).toFixed(1)}</TableCell>
                        <TableCell className="max-w-[420px] truncate">{review.comment || "-"}</TableCell>
                        <TableCell>{formatDate(review.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
