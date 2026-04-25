"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Check } from "lucide-react";
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
import { updateUserRole } from "@/app/admin/actions";
import { type ProfileRole } from "@/lib/security/adminRole";
import { cn } from "@/lib/utils";

export type AdminUserRow = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: ProfileRole;
  createdAt: string;
};

const ROLES: ProfileRole[] = ["customer", "staff", "admin", "wholesale"];

export function UsersDataTable({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const changeRole = (userId: string, newRole: ProfileRole) => {
    startTransition(async () => {
      setPendingUserId(userId);
      try {
        const result = await updateUserRole(userId, newRole);

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        toast.success(result?.message || `User role updated to ${newRole}.`);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update user role right now."
        );
      } finally {
        setPendingUserId(null);
      }
    });
  };

  return (
    <div className="rounded-[1.4rem] border border-border/70 bg-card/45 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/70">
            <TableHead className="py-5">User</TableHead>
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
                  ? "bg-emerald-100/50 text-emerald-700"
                  : user.role === "wholesale"
                    ? "bg-blue-100/50 text-blue-700"
                  : user.role === "staff"
                    ? "bg-amber-100/50 text-amber-700"
                    : "bg-slate-100/50 text-slate-700";

              const loading = isPending && pendingUserId === user.id;

              return (
                <TableRow key={user.id} className="border-border/60">
                  <TableCell className="font-medium">{user.fullName || "Unnamed user"}</TableCell>
                  <TableCell className="text-foreground/70">{user.email || "-"}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                      roleBadge
                    )}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground/60 text-xs">
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={loading}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-background/50 hover:bg-background hover:border-primary/30 transition-all"
                        aria-label="Open user actions"
                      >
                        {loading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4 text-foreground/70" />
                        )}
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 glass-shell border-primary/20">
                        <DropdownMenuLabel className="px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-foreground/40">
                          Set Access Role
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/50" />
                        {ROLES.map((role) => (
                          <DropdownMenuItem
                            key={role}
                            className={cn(
                              "cursor-pointer flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors",
                              user.role === role ? "bg-primary/10 text-primary" : "hover:bg-muted"
                            )}
                            disabled={isPending || user.role === role}
                            onClick={() => changeRole(user.id, role)}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider">{role}</span>
                            {user.role === role && <Check className="h-3.5 w-3.5" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
