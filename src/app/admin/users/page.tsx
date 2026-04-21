import { UsersDataTable, type AdminUserRow } from "@/components/admin/UsersDataTable";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ADMIN_PAGE_SIZE, pageRange, parsePageParam, totalPages } from "@/lib/adminPagination";
import { requireAdminAccess } from "@/lib/security/adminRole";
import type { Database } from "@/lib/supabase/types";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Users | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "full_name" | "role" | "created_at"
>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ page: pageParam }, { supabase }] = await Promise.all([
    searchParams,
    requireAdminAccess({ from: "/admin/users" }),
  ]);

  const requestedPage = parsePageParam(pageParam);

  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const pages = totalPages(count ?? 0, ADMIN_PAGE_SIZE);
  const currentPage = Math.min(requestedPage, pages);

  if (requestedPage !== currentPage) {
    if (currentPage <= 1) {
      redirect("/admin/users");
    }
    redirect(`/admin/users?page=${currentPage}`);
  }

  const { from, to } = pageRange(currentPage, ADMIN_PAGE_SIZE);

  const { data: profilesRaw } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  const users: AdminUserRow[] = ((profilesRaw as any[] ?? []) as ProfileRow[]).map((profile) => ({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    createdAt: profile.created_at,
  }));

  return (
    <section className="glass-shell rounded-[1.5rem] p-5 md:p-7">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Identity Operations</p>
        <h2 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">Users</h2>
        <p className="mt-2 text-sm text-foreground/65">
          Manage user roles and promote selected accounts to admin access.
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-foreground/55">
          {count ?? 0} total user{count === 1 ? "" : "s"}
        </p>
      </header>

      <UsersDataTable users={users} />

      <AdminPagination
        basePath="/admin/users"
        currentPage={currentPage}
        totalPages={pages}
      />
    </section>
  );
}
