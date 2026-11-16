import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { saveFaq } from "@/lib/actions/admin";

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
      <SmartForm action={saveFaq} submit="Save FAQ">
        <h1 className="display text-4xl">FAQs</h1>
        <input type="hidden" name="id" value={current?.id ?? ""} />
        <label><span className="label">Question</span><input className="field" name="question" defaultValue={current?.question} required /></label>
        <label><span className="label">Answer</span><textarea className="field min-h-28" name="answer" defaultValue={current?.answer} required /></label>
        <label><span className="label">Sort</span><input className="field" name="sortOrder" defaultValue={current?.sortOrder ?? 0} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={current?.active ?? true} /> Visible</label>
      </SmartForm>
      <ul className="grid content-start gap-2 text-sm">{items.map((item) => <li key={item.id}><a href={`/admin/faqs?id=${item.id}`}>{item.question}</a></li>)}</ul>
    </div>
  );
}
