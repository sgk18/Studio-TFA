"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { promoteUserToAdmin } from "@/app/admin/actions";

export type AdminUserRow = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: "customer" | "staff" | "admin" | "wholesale";
  createdAt: string;
};

export function UsersDataTable({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const promote = (user: AdminUserRow) => {
    if (user.role === "admin") {
      return;
    }

    startTransition(async () => {
      setPendingUserId(user.id);
      const result = await promoteUserToAdmin(user.id);

      if (result?.error) {
        toast.error(result.error);
        setPendingUserId(null);
        return;
      }

      toast.success(`${user.email ?? user.id} promoted to admin.`);
      setPendingUserId(null);
      router.refresh();
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-36 text-center text-muted-foreground">
              No users found.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => {
            const roleBadge =
              user.role === "admin"
                ? "bg-emerald-100 text-emerald-700"
                : user.role === "wholesale"
                  ? "bg-blue-100 text-blue-700"
                : user.role === "staff"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-700";

            const loading = isPending && pendingUserId === user.id;

            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName || "Unnamed user"}</TableCell>
                <TableCell>{user.email || "-"}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${roleBadge}`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-card/45"
                      aria-label="Open user actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={user.role === "admin" || loading}
                        onClick={() => promote(user)}
                      >
                        {loading
                          ? "Promoting..."
                          : user.role === "admin"
                            ? "Already Admin"
                            : "Promote to Admin"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
