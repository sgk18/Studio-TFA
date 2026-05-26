import { Suspense } from "react";
import { UsersDataTable } from "./UsersDataTable";
import { UsersTableFilters } from "./UsersTableFilters";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { requireAdminAccess } from "@/lib/security/adminRole";
import { fetchUsers } from "./actions";
import { parsePageParam } from "@/lib/adminPagination";

export const metadata = {
  title: "Users | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string;
    search?: string;
    role?: string;
    status?: string;
    provider?: string;
  }>;
}) {
  const [{ page: pageParam, search, role, status, provider }] = await Promise.all([
    searchParams,
    requireAdminAccess({ 
      from: "/admin/users",
      allowedRoles: ["admin" as any]
    }),
  ]);

  const currentPage = parsePageParam(pageParam);

  const { users, totalCount, totalPages } = await fetchUsers({
    page: currentPage,
    search,
    role,
    status,
    provider,
  });

  return (
    <section className="glass-shell rounded-[1.5rem] p-5 md:p-7">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Identity Operations</p>
          <h2 className="mt-2 font-heading text-4xl tracking-tight md:text-5xl">Users</h2>
          <p className="mt-2 text-sm text-foreground/65 max-w-xl">
            Manage user accounts securely. View details, adjust roles, and monitor authentication status.
          </p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-foreground/55">
            {totalCount ?? 0} total user{totalCount === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <Suspense fallback={<div className="h-64 animate-pulse bg-card/40 rounded-xl" />}>
        <UsersTableFilters 
          search={search}
          role={role}
          status={status}
          provider={provider}
        />
      </Suspense>

      <div className="mt-6">
        <UsersDataTable users={users} />
      </div>

      <div className="mt-6">
        <AdminPagination
          basePath="/admin/users"
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </section>
  );
}
