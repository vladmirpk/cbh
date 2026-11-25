import { formatDate } from "@/lib/format";
import { leadStatusLabel, stageReasonLabel } from "@/lib/types";

type EventRow = {
  id: string;
  kind: string;
  body: string;
  reason: string | null;
  fromStatus: string | null;
  toStatus: string | null;
  followUpDate: string | null;
  followUpAction: string | null;
  authorName: string;
  createdAt: Date;
};

type NoteRow = {
  id: string;
  body: string;
  authorName: string;
  createdAt: Date;
};

const KIND_LABEL: Record<string, string> = {
  stage_change: "Stage change",
  note: "Note",
  follow_up: "Follow-up",
  claim: "Claimed",
  assignment: "Assignment",
};

export function LeadActivity({ events, notes }: { events: EventRow[]; notes: NoteRow[] }) {
  const legacy = notes
    .filter((note) => !events.some((event) => event.body === note.body && Math.abs(event.createdAt.getTime() - note.createdAt.getTime()) < 5000))
    .map((note) => ({
      id: `note-${note.id}`,
      kind: "note",
      body: note.body,
      reason: null as string | null,
      fromStatus: null as string | null,
      toStatus: null as string | null,
      followUpDate: null as string | null,
      followUpAction: null as string | null,
      authorName: note.authorName,
      createdAt: note.createdAt,
    }));

  const rows = [...events, ...legacy].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="panel p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">CRM timeline</p>
      <h2 className="display mt-1 text-2xl text-ink">Activity</h2>
      <p className="mt-1 text-sm text-stone">Every stage move and desk note — the trail of why this customer is here.</p>

      <ol className="relative mt-5 space-y-0 border-l border-line pl-5">
        {rows.map((row) => (
          <li key={row.id} className="relative pb-5 last:pb-0">
            <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#0c3c8c] shadow" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-plaster px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-stone">
                {KIND_LABEL[row.kind] || row.kind}
              </span>
              {row.fromStatus && row.toStatus && row.fromStatus !== row.toStatus ? (
                <span className="text-xs font-semibold text-ink">
                  {leadStatusLabel(row.fromStatus)} → {leadStatusLabel(row.toStatus)}
                </span>
              ) : null}
              {row.reason ? (
                <span className="text-xs text-stone">{stageReasonLabel(row.reason)}</span>
              ) : null}
            </div>
            <p className="mt-1.5 text-sm text-[#10233f]">{row.body}</p>
            {(row.followUpAction || row.followUpDate) && (
              <p className="mt-1 text-xs font-semibold text-[#0c3c8c]">
                {row.followUpAction ? `Next: ${row.followUpAction}` : null}
                {row.followUpAction && row.followUpDate ? " · " : null}
                {row.followUpDate ? `Due ${row.followUpDate}` : null}
              </p>
            )}
            <p className="mt-1 text-[11px] text-stone">
              {row.authorName} · {formatDate(row.createdAt)}
            </p>
          </li>
        ))}
        {!rows.length ? <li className="text-sm text-stone">No activity yet — log the first contact.</li> : null}
      </ol>
    </div>
  );
}
