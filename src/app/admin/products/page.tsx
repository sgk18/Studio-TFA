import Image from "next/image";

import { AddProductModal } from "@/components/admin/AddProductModal";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ADMIN_PAGE_SIZE, pageRange, parsePageParam, totalPages } from "@/lib/adminPagination";
import { formatINR } from "@/lib/currency";
import { requireAdminAccess } from "@/lib/security/adminRole";
import type { Database } from "@/lib/supabase/types";

export const metadata = {
  title: "Products | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

type ProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "title" | "category" | "price" | "stock" | "is_active" | "image_url" | "created_at"
>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ page: pageParam }, { supabase }] = await Promise.all([
    searchParams,
    requireAdminAccess({ from: "/admin/products" }),
  ]);

  const currentPage = parsePageParam(pageParam);
  const { from, to } = pageRange(currentPage, ADMIN_PAGE_SIZE);

  const { data: productsRaw, count } = await supabase
    .from("products")
    .select("id, title, category, price, stock, is_active, image_url, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  const products = (productsRaw ?? []) as ProductRow[];
  const pages = totalPages(count ?? 0, ADMIN_PAGE_SIZE);

  return (
    <section className="glass-shell rounded-[1.5rem] p-5 md:p-7">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Product Operations
          </p>
          <h2 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">
            Inventory
          </h2>
          <p className="mt-2 text-sm text-foreground/65">
            Server-paginated product catalog with direct storage uploads.
          </p>
        </div>

        <AddProductModal />
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-14 w-12 overflow-hidden rounded-lg border border-border/70 bg-card/45">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{formatINR(product.price)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                      product.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(product.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AdminPagination
        basePath="/admin/products"
        currentPage={currentPage}
        totalPages={pages}
      />
    </section>
  );
}
