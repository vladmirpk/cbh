import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { deleteFaq, saveFaq } from "@/lib/actions/admin";

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
        <SmartForm action={saveFaq} submit="Save FAQ">
          <h1 className="display text-4xl">{current ? "Edit FAQ" : "FAQs"}</h1>
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <label><span className="label">Question</span><input className="field" name="question" defaultValue={current?.question} required /></label>
          <label><span className="label">Answer</span><textarea className="field min-h-28" name="answer" defaultValue={current?.answer} required /></label>
          <label><span className="label">Sort</span><input className="field" name="sortOrder" defaultValue={current?.sortOrder ?? 0} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={current?.active ?? true} /> Visible</label>
        </SmartForm>
        {current ? (
          <form action={deleteFaq} className="mt-4">
            <input type="hidden" name="id" value={current.id} />
            <button className="btn btn-ghost text-[#b42318]" type="submit">Delete FAQ</button>
          </form>
        ) : null}
        {current ? <p className="mt-3 text-sm"><Link href="/admin/faqs">New FAQ</Link></p> : null}
      </div>
      <ul className="grid content-start gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="panel flex items-center justify-between gap-3 p-3">
            <div>
              <Link href={`/admin/faqs?id=${item.id}`} className="font-semibold">{item.question}</Link>
              <p className="text-stone">{item.active ? "Visible" : "Hidden"}</p>
            </div>
            <Link href={`/admin/faqs?id=${item.id}`} className="text-xs">Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
