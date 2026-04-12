import { type ReactNode } from "react";

import { requireAdminAccess } from "@/lib/security/adminRole";

export default async function AdminRouteGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminAccess({ from: "/admin" });
  return children;
}
