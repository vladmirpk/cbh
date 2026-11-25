import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { deletePromotion } from "@/lib/actions/admin";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { Cover } from "@/components/site/Cover";
import { formatDate } from "@/lib/format";

const CTA_LABEL: Record<string, string> = {
  quote: "Get a quote",
  buy: "Browse",
  interest: "Register interest",
  whatsapp: "WhatsApp",
  delivery: "Delivery",
  preorder: "Pre-order",
};

export default async function PromotionsAdminPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireUser();
  if (!canManageContent(user.role)) return <Denied />;
  const { id } = await searchParams;
  const [items, current] = await Promise.all([
    prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
    id ? prisma.promotion.findUnique({ where: { id } }) : null,
  ]);
  const editing = Boolean(current) || id === "new";

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Marketing</p>
          <h1 className="display mt-1 text-4xl text-ink">
            {current ? "Edit campaign" : id === "new" ? "New campaign" : "Promotions"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-stone">
            Build poster-led offers with a clear call to action. Upload artwork so campaigns stay online after redeploys.
          </p>
        </div>
        {!editing ? (
          <Link href="/admin/promotions?id=new" className="btn btn-primary">
            New campaign
          </Link>
        ) : (
          <Link href="/admin/promotions" className="btn btn-ghost border border-line">
            All campaigns
          </Link>
        )}
      </div>

      {editing ? (
        <div className="grid gap-6">
          <PromotionForm promotion={current} />
          {current ? (
            <form action={deletePromotion} className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
              <input type="hidden" name="id" value={current.id} />
              <button className="btn btn-ghost border border-[#f5c2c0] text-[#b42318]" type="submit">
                Delete campaign
              </button>
              <p className="text-xs text-stone">Removes it from the public site and the desk list.</p>
            </form>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_rgba(12,60,140,0.05)]">
              <div className="relative aspect-[16/9] bg-[#e8eef8]">
                <Cover src={item.image} alt="" />
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    item.active ? "bg-[#e7f6ee] text-[#157347]" : "bg-[#e8eef8] text-stone"
                  }`}
                >
                  {item.active ? "Live" : "Hidden"}
                </span>
              </div>
              <div className="p-4">
                {item.discount ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-copper">{item.discount}</p>
                ) : null}
                <h2 className="mt-1 text-lg font-extrabold text-ink">{item.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-stone">{item.headline}</p>
                <p className="mt-3 text-xs text-stone">
                  {CTA_LABEL[item.cta] || item.cta}
                  {item.expiresAt ? ` · ends ${item.expiresAt}` : ""}
                  {" · "}
                  {formatDate(item.createdAt)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/promotions?id=${item.id}`} className="btn btn-ink h-9 px-3 text-sm">
                    Edit
                  </Link>
                  <Link href={`/promotions/${item.slug}`} className="btn btn-ghost h-9 border border-line px-3 text-sm" target="_blank">
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {!items.length ? (
            <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center sm:col-span-2 xl:col-span-3">
              <p className="font-extrabold text-ink">No campaigns yet</p>
              <p className="mt-2 text-sm text-stone">Create a poster-led offer for the homepage and promotions page.</p>
              <Link href="/admin/promotions?id=new" className="btn btn-primary mt-4">
                New campaign
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
