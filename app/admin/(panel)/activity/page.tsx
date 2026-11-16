import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Denied } from "@/components/ui";
import { formatDate } from "@/lib/format";

export default async function ActivityPage() {
  const user = await requireUser();
  if (!["super_admin", "management"].includes(user.role)) return <Denied />;
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div>
      <h1 className="display text-4xl">Audit log</h1>
      <ul className="mt-6 divide-y divide-line text-sm">
        {logs.map((log) => (
          <li key={log.id} className="grid gap-1 py-3 md:grid-cols-[140px_1fr]">
            <span className="text-stone">{formatDate(log.createdAt)}</span>
            <span>{log.actorEmail || "system"} · {log.action} {log.entity} {log.detail || ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
