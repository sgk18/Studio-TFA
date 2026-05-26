"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Check, ShieldAlert, ShieldBan, UserCog } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
import { toggleUserStatus } from "./actions";
import { type ProfileRole } from "@/lib/security/adminRole";
import { cn } from "@/lib/utils";
import { UserDetailsDrawer } from "./UserDetailsDrawer";

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: ProfileRole | string;
  signup_date: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  provider: string | null;
};

const ROLES: ProfileRole[] = ["customer", "admin"];

export function UsersDataTable({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const changeStatus = (userId: string, action: "enable" | "disable") => {
    startTransition(async () => {
      setPendingUserId(userId);
      try {
        const result = await toggleUserStatus(userId, action);

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        toast.success(result?.message || `User account has been ${action}d.`);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update user status right now."
        );
      } finally {
        setPendingUserId(null);
      }
    });
  };

  const openUserDetails = (user: AdminUserRow) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  return (
    <>
      <div className="rounded-[1.4rem] border border-border/70 bg-card/45 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/70">
              <TableHead className="py-5">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                  No users match your criteria.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const roleBadge =
                  user.role === "admin"
                    ? "bg-[#D17484]/15 text-[#D17484]"
                    : "bg-slate-100/50 text-slate-700";

                const isBanned = user.banned_until && new Date(user.banned_until) > new Date();
                const statusBadge = isBanned
                  ? "bg-red-100/50 text-red-700"
                  : "bg-emerald-100/50 text-emerald-700";

                const loading = isPending && pendingUserId === user.id;

                return (
                  <TableRow 
                    key={user.id} 
                    className="border-border/60 hover:bg-card/60 transition-colors cursor-pointer"
                    onClick={() => openUserDetails(user)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0AEBA]/20 text-[#8B263E] font-heading font-bold text-xs">
                          {(user.full_name?.[0] || user.email?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span>{user.full_name || "Unnamed user"}</span>
                          <span className="text-[10px] text-foreground/40 font-mono tracking-tighter truncate w-24">
                            {user.id.split('-')[0]}...
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground/70">{user.email || "-"}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                        statusBadge
                      )}>
                        {isBanned ? "Disabled" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                        roleBadge
                      )}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs uppercase tracking-wider text-foreground/50 font-bold">
                        {user.provider || "email"}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground/60 text-xs">
                      {format(new Date(user.signup_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={loading}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-background/50 hover:bg-background hover:border-primary/30 transition-all"
                          aria-label="Open user actions"
                        >
                          {loading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D17484] border-t-transparent" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4 text-foreground/70" />
                          )}
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 glass-shell border-primary/20">
                          <DropdownMenuLabel className="px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-foreground/40">
                            Set Access Role
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border/50" />
                          {ROLES.map((role) => (
                            <DropdownMenuItem
                              key={role}
                              className={cn(
                                "cursor-pointer flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors",
                                user.role === role ? "bg-[#D17484]/10 text-[#8B263E]" : "hover:bg-muted"
                              )}
                              disabled={isPending || user.role === role}
                              onClick={() => changeRole(user.id, role)}
                            >
                              <div className="flex items-center gap-2">
                                <UserCog className="h-3.5 w-3.5 opacity-50" />
                                <span className="text-xs font-bold uppercase tracking-wider">{role}</span>
                              </div>
                              {user.role === role && <Check className="h-3.5 w-3.5" />}
                            </DropdownMenuItem>
                          ))}
                          
                          <DropdownMenuSeparator className="bg-border/50 my-2" />
                          <DropdownMenuLabel className="px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-foreground/40">
                            Security
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-border/50" />
                          
                          {isBanned ? (
                            <DropdownMenuItem
                              className="cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-emerald-50 text-emerald-600"
                              onClick={() => changeStatus(user.id, "enable")}
                            >
                              <ShieldAlert className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Enable Account</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-red-50 text-red-600"
                              onClick={() => changeStatus(user.id, "disable")}
                              disabled={user.role === "admin"}
                            >
                              <ShieldBan className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Disable Account</span>
                            </DropdownMenuItem>
                          )}
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

      <UserDetailsDrawer
        user={selectedUser}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
}
