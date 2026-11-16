import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { savePromotion } from "@/lib/actions/admin";

export default async function PromotionsAdminPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireUser();
  if (!canManageContent(user.role)) return <Denied />;
  const { id } = await searchParams;
  const [items, current] = await Promise.all([
    prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
    id ? prisma.promotion.findUnique({ where: { id } }) : null,
  ]);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="display text-4xl">{current ? "Edit promotion" : "New promotion"}</h1>
        <div className="mt-4">
          <SmartForm action={savePromotion} submit="Save promotion">
            <input type="hidden" name="id" value={current?.id ?? ""} />
            <label><span className="label">Title</span><input className="field" name="title" defaultValue={current?.title} required /></label>
            <label><span className="label">Headline</span><input className="field" name="headline" defaultValue={current?.headline} required /></label>
            <label><span className="label">Description</span><textarea className="field min-h-24" name="description" defaultValue={current?.description} /></label>
            <label><span className="label">Image URL</span><input className="field" name="image" defaultValue={current?.image ?? ""} /></label>
            <label><span className="label">Price label</span><input className="field" name="priceLabel" defaultValue={current?.priceLabel ?? ""} /></label>
            <label><span className="label">Discount</span><input className="field" name="discount" defaultValue={current?.discount ?? ""} /></label>
            <label><span className="label">Call to action</span>
              <select className="field" name="cta" defaultValue={current?.cta ?? "quote"}>
                {["quote", "buy", "interest", "whatsapp", "delivery", "preorder"].map((cta) => <option key={cta}>{cta}</option>)}
              </select>
            </label>
            <label><span className="label">Link</span><input className="field" name="ctaHref" defaultValue={current?.ctaHref ?? "/quote"} /></label>
            <label><span className="label">Target location</span><input className="field" name="targetArea" defaultValue={current?.targetArea ?? ""} /></label>
            <label><span className="label">Audience</span><input className="field" name="audience" defaultValue={current?.audience ?? ""} /></label>
            <label><span className="label">Expiry</span><input className="field" type="date" name="expiresAt" defaultValue={current?.expiresAt ?? ""} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={current?.active ?? true} /> Active</label>
          </SmartForm>
        </div>
      </div>
      <ul className="grid gap-2 text-sm">
        {items.map((item) => <li key={item.id} className="panel p-3"><a href={`/admin/promotions?id=${item.id}`} className="font-semibold">{item.title}</a><p className="text-stone">{item.active ? "Live" : "Hidden"} · {item.cta}</p></li>)}
      </ul>
    </div>
  );
}
