import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Denied } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { clearAuditLogs } from "@/lib/actions/admin";
import { PreviewSheet } from "@/components/admin/PreviewSheet";
import { ConfirmAction } from "@/components/admin/ConfirmAction";

export default async function ActivityPage() {
  const user = await requireUser();
  if (!["super_admin", "management"].includes(user.role)) return <Denied />;
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-4xl text-ink">Audit log</h1>
          <p className="mt-2 text-sm text-stone">Preview entries, or clear logs older than 90 days with confirmation.</p>
        </div>
        <ConfirmAction
          action={clearAuditLogs}
          fields={{ before: cutoff }}
          label="Clear older than 90 days"
          confirm={{
            title: "Clear old audit rows?",
            message: `Permanently deletes audit entries before ${cutoff}. Recent activity stays.`,
            confirmLabel: "Clear old logs",
            cancelLabel: "Keep logs",
            tone: "danger",
          }}
        />
      </div>
      <ul className="mt-6 divide-y divide-line text-sm">
        {logs.map((log) => (
          <li key={log.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
            <div className="grid min-w-0 gap-1 md:grid-cols-[140px_1fr]">
              <span className="text-stone">{formatDate(log.createdAt)}</span>
              <span className="text-ink">
                <span className="font-semibold">{log.actorEmail || "system"}</span>
                {" · "}
                {log.action} {log.entity}
                {log.detail ? ` · ${log.detail}` : ""}
              </span>
            </div>
            <PreviewSheet
              title={`${log.action} ${log.entity}`}
              lines={[
                { label: "When", value: formatDate(log.createdAt) },
                { label: "Actor", value: log.actorEmail || "system" },
                { label: "Action", value: log.action },
                { label: "Entity", value: log.entity },
                { label: "Detail", value: log.detail || "—" },
                { label: "Entity ID", value: log.entityId || "—" },
              ]}
            />
          </li>
        ))}
        {!logs.length ? <li className="py-6 text-stone">No audit entries yet.</li> : null}
      </ul>
    </div>
  );
}
