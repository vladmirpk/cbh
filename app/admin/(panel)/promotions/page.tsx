import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { deletePromotion } from "@/lib/actions/admin";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { Cover } from "@/components/site/Cover";
import { formatDate } from "@/lib/format";
import { RowActions } from "@/components/admin/RowActions";
import { PreviewSheet } from "@/components/admin/PreviewSheet";
import { ConfirmAction } from "@/components/admin/ConfirmAction";

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
            Preview, edit, or delete campaigns. Destructive actions always ask for confirmation.
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
            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
              <ConfirmAction
                action={deletePromotion}
                fields={{ id: current.id }}
                label="Delete campaign"
                className="btn btn-ghost border border-[#f5c2c0] text-[#b42318]"
                confirm={{
                  title: `Delete “${current.title}”?`,
                  message: "Removes it from the public site and the desk list.",
                  confirmLabel: "Delete campaign",
                  cancelLabel: "Keep campaign",
                  tone: "danger",
                  image: current.image,
                }}
              />
              <p className="text-xs text-stone">Confirmation required before it leaves the site.</p>
            </div>
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
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <PreviewSheet
                    title={item.title}
                    editHref={`/admin/promotions?id=${item.id}`}
                    previewHref={`/promotions/${item.slug}`}
                    lines={[
                      { label: "CTA", value: CTA_LABEL[item.cta] || item.cta },
                      { label: "Status", value: item.active ? "Live" : "Hidden" },
                      { label: "Headline", value: item.headline || "—" },
                      { label: "Expires", value: item.expiresAt || "—" },
                    ]}
                  />
                  <RowActions
                    previewHref={`/promotions/${item.slug}`}
                    previewLabel="Live"
                    previewExternal
                    editHref={`/admin/promotions?id=${item.id}`}
                    deleteAction={deletePromotion}
                    deleteFields={{ id: item.id }}
                    deleteConfirm={{
                      title: `Delete “${item.title}”?`,
                      message: "Removes it from the public site and the desk list.",
                      confirmLabel: "Delete campaign",
                      cancelLabel: "Keep campaign",
                      tone: "danger",
                      image: item.image,
                    }}
                  />
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
