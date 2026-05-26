"use client";

import { useCallback, useTransition, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function UsersTableFilters({
  search,
  role,
  status,
  provider,
}: {
  search?: string;
  role?: string;
  status?: string;
  provider?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set("page", "1"); // Reset to first page on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    startTransition(() => {
      router.push(pathname + "?" + createQueryString(name, value));
    });
  };

  const debouncedSearch = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      handleFilterChange("search", value);
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card/30 p-4 rounded-2xl border border-border/40">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-foreground/40">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          className="w-full bg-background border border-border/70 text-foreground text-sm rounded-xl focus:ring-primary focus:border-primary block pl-10 p-2.5 transition-colors"
          placeholder="Search by name, email, or ID..."
          defaultValue={search}
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
        <select
          className="bg-background border border-border/70 text-foreground text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 transition-colors cursor-pointer"
          defaultValue={role || "all"}
          onChange={(e) => handleFilterChange("role", e.target.value)}
          disabled={isPending}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>

        <select
          className="bg-background border border-border/70 text-foreground text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 transition-colors cursor-pointer"
          defaultValue={status || "all"}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          disabled={isPending}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>

        <select
          className="bg-background border border-border/70 text-foreground text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 transition-colors cursor-pointer"
          defaultValue={provider || "all"}
          onChange={(e) => handleFilterChange("provider", e.target.value)}
          disabled={isPending}
        >
          <option value="all">All Providers</option>
          <option value="email">Email</option>
          <option value="google">Google</option>
        </select>
      </div>
    </div>
  );
}
