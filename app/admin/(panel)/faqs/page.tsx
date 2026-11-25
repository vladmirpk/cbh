import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { deleteFaq, saveFaq } from "@/lib/actions/admin";
import { RowActions } from "@/components/admin/RowActions";
import { PreviewSheet } from "@/components/admin/PreviewSheet";
import { ConfirmAction } from "@/components/admin/ConfirmAction";

export default async function FaqsAdmin({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireUser();
  if (!canManageContent(user.role)) return <Denied />;
  const { id } = await searchParams;
  const [items, current] = await Promise.all([
    prisma.faq.findMany({ orderBy: { sortOrder: "asc" } }),
    id ? prisma.faq.findUnique({ where: { id } }) : null,
  ]);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <SmartForm
          action={saveFaq}
          submit="Save FAQ"
          confirm={
            current
              ? {
                  title: "Save FAQ changes?",
                  message: "Visible FAQs update on the public help page.",
                  detail: current.question,
                  confirmLabel: "Save FAQ",
                  cancelLabel: "Keep editing",
                }
              : undefined
          }
        >
          <h1 className="display text-4xl">{current ? "Edit FAQ" : "FAQs"}</h1>
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <label><span className="label">Question</span><input className="field" name="question" defaultValue={current?.question} required /></label>
          <label><span className="label">Answer</span><textarea className="field min-h-28" name="answer" defaultValue={current?.answer} required /></label>
          <label><span className="label">Sort</span><input className="field" name="sortOrder" defaultValue={current?.sortOrder ?? 0} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={current?.active ?? true} /> Visible</label>
        </SmartForm>
        {current ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ConfirmAction
              action={deleteFaq}
              fields={{ id: current.id }}
              label="Delete FAQ"
              confirm={{
                title: "Delete this FAQ?",
                message: "It will disappear from the public FAQ list.",
                detail: current.question,
                confirmLabel: "Delete FAQ",
                cancelLabel: "Keep FAQ",
                tone: "danger",
              }}
            />
            <Link href="/admin/faqs" className="text-sm font-bold text-ink hover:underline">New FAQ</Link>
          </div>
        ) : null}
      </div>
      <ul className="grid content-start gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="panel flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="font-semibold text-ink">{item.question}</p>
              <p className="text-stone">{item.active ? "Visible" : "Hidden"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <PreviewSheet
                title={item.question}
                editHref={`/admin/faqs?id=${item.id}`}
                previewHref="/contact"
                lines={[
                  { label: "Status", value: item.active ? "Visible" : "Hidden" },
                  { label: "Sort", value: String(item.sortOrder) },
                  { label: "Answer", value: item.answer.slice(0, 180) },
                ]}
              />
              <RowActions
                previewHref="/contact"
                previewLabel="Live"
                previewExternal
                editHref={`/admin/faqs?id=${item.id}`}
                deleteAction={deleteFaq}
                deleteFields={{ id: item.id }}
                deleteConfirm={{
                  title: "Delete this FAQ?",
                  message: "It will disappear from the public FAQ list.",
                  detail: item.question,
                  confirmLabel: "Delete FAQ",
                  cancelLabel: "Keep FAQ",
                  tone: "danger",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
