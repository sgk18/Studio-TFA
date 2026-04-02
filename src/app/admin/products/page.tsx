import { redirect } from "next/navigation";
import Link from "next/link";
import { ProductTable } from "@/components/admin/ProductTable";
import { verifyMasterAdminAccess } from "@/lib/security/masterAdminServer";

export const metadata = {
  title: "Inventory | Studio TFA Admin",
};

export default async function AdminProductsPage() {
  const access = await verifyMasterAdminAccess({ path: "/admin/products" });
  if (!access.decision.allowed) {
    redirect(`/login?error=${encodeURIComponent(access.message)}&redirectedFrom=/admin/products`);
  }

  const supabase = access.supabase;
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-10 pt-32 px-6 max-w-7xl min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-heading tracking-tight mb-2">Inventory Management</h1>
          <p className="text-muted-foreground tracking-widest uppercase text-xs font-bold">Manage your products, pricing, and stock levels.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
          >
            Analytics
          </Link>
          <Link
            href="/admin/access"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all"
          >
            Access Control
          </Link>
        </div>
      </div>
      <ProductTable initialData={products || []} />
    </div>
  );
}
