import { createClient } from "@/utils/supabase/server";
import { ProductTable } from "@/components/admin/ProductTable";

export const metadata = {
  title: "Inventory | Studio TFA Admin",
};

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-10 pt-32 px-6 max-w-7xl min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-heading tracking-tight mb-2">Inventory Management</h1>
          <p className="text-muted-foreground tracking-widest uppercase text-xs font-bold">Manage your products, pricing, and stock levels.</p>
        </div>
      </div>
      <ProductTable initialData={products || []} />
    </div>
  );
}
