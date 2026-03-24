// Shared analytics data — can be replaced with live Supabase queries
export const BRAND_COLORS = {
  rose:  "#D17484",
  deep:  "#8B263E",
  blush: "#E0AEBA",
  olive: "#786825",
  dark:  "#292800",
};

export const revenueData = [
  { month: "Oct", revenue: 8400 },
  { month: "Nov", revenue: 13200 },
  { month: "Dec", revenue: 19800 },
  { month: "Jan", revenue: 11500 },
  { month: "Feb", revenue: 15700 },
  { month: "Mar", revenue: 21400 },
];

export const bestSellersData = [
  { name: "Quiet Morning Journal", qty: 84 },
  { name: "Words of Grace – Book",  qty: 67 },
  { name: "Olive Branch Wall Print", qty: 49 },
  { name: "Faith First Tote",       qty: 38 },
  { name: "Blessing Gift Hamper",   qty: 29 },
];

export const categoryData = [
  { name: "Journals",   value: 34, color: "#D17484" },
  { name: "Books",      value: 27, color: "#8B263E" },
  { name: "Home Decor", value: 19, color: "#E0AEBA" },
  { name: "Apparels",   value: 12, color: "#786825" },
  { name: "Gift Sets",  value: 8,  color: "#292800" },
];

export const statCards = [
  { label: "Total Revenue",  value: "₹90,000", sub: "+18% vs last period" },
  { label: "Total Orders",   value: "267",      sub: "Across all categories" },
  { label: "Avg Order Value", value: "₹337",    sub: "Per completed order"  },
];
