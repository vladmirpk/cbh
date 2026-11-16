import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/Shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await prisma.notification.count({ where: { read: false } });
  return (
    <AdminShell user={user} unread={unread}>
      {children}
    </AdminShell>
  );
}
