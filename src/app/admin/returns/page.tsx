import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ADMIN_PAGE_SIZE, pageRange, parsePageParam, totalPages } from "@/lib/adminPagination";
import { formatINR } from "@/lib/currency";
import { requireAdminAccess } from "@/lib/security/adminRole";
import type { Database } from "@/lib/supabase/types";

export const metadata = {
  title: "Returns | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

type ReturnRow = Pick<
  Database["public"]["Tables"]["returns"]["Row"],
  "id" | "order_id" | "user_id" | "reason" | "status" | "refund_amount" | "created_at"
>;

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ page: pageParam }, { supabase }] = await Promise.all([
    searchParams,
    requireAdminAccess({ from: "/admin/returns" }),
  ]);

  const currentPage = parsePageParam(pageParam);
  const { from, to } = pageRange(currentPage, ADMIN_PAGE_SIZE);

  const { data: returnsRaw, count } = await supabase
    .from("returns")
    .select("id, order_id, user_id, reason, status, refund_amount, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  const returns = (returnsRaw ?? []) as ReturnRow[];
  const pages = totalPages(count ?? 0, ADMIN_PAGE_SIZE);

  return (
    <section className="glass-shell rounded-[1.5rem] p-5 md:p-7">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Returns Operations</p>
        <h2 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">Returns</h2>
        <p className="mt-2 text-sm text-foreground/65">
          Track return requests and refund exposure with server-side pagination.
        </p>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Return ID</TableHead>
            <TableHead>Order ID</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Refund</TableHead>
            <TableHead>Requested</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {returns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                No return records found.
              </TableCell>
            </TableRow>
          ) : (
            returns.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-foreground/70">{item.id}</TableCell>
                <TableCell className="font-mono text-xs text-foreground/70">{item.order_id}</TableCell>
                <TableCell className="max-w-[360px] truncate">{item.reason}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  {item.refund_amount === null ? "-" : formatINR(Number(item.refund_amount) || 0)}
                </TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleDateString("en-IN", {
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
        basePath="/admin/returns"
        currentPage={currentPage}
        totalPages={pages}
      />
    </section>
  );
}
