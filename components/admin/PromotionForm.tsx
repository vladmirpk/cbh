"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SmartForm } from "@/components/SmartForm";
import { ImageField } from "@/components/admin/ImageField";
import { savePromotion } from "@/lib/actions/admin";
import { Cover } from "@/components/site/Cover";

const CTA_OPTIONS = [
  { id: "quote", label: "Get a quote", hint: "Opens the quotation wizard" },
  { id: "buy", label: "Browse / buy", hint: "Send shoppers to a product or category" },
  { id: "interest", label: "Register interest", hint: "For coming-soon / launch lines" },
  { id: "whatsapp", label: "WhatsApp us", hint: "Opens a chat with the offer prefilled" },
  { id: "delivery", label: "Delivery price", hint: "Point at delivery or quote" },
  { id: "preorder", label: "Pre-order", hint: "For stock on the way" },
] as const;

type PromotionInput = {
  id: string;
  title: string;
  headline: string;
  description: string;
  image: string | null;
  priceLabel: string | null;
  discount: string | null;
  cta: string;
  ctaHref: string | null;
  targetArea: string | null;
  audience: string | null;
  expiresAt: string | null;
  active: boolean;
  slug?: string;
};

export function PromotionForm({ promotion }: { promotion?: PromotionInput | null }) {
  const [title, setTitle] = useState(promotion?.title ?? "");
  const [headline, setHeadline] = useState(promotion?.headline ?? "");
  const [description, setDescription] = useState(promotion?.description ?? "");
  const [discount, setDiscount] = useState(promotion?.discount ?? "");
  const [priceLabel, setPriceLabel] = useState(promotion?.priceLabel ?? "");
  const [cta, setCta] = useState(promotion?.cta ?? "quote");
  const [ctaHref, setCtaHref] = useState(promotion?.ctaHref ?? "/quote");
  const [audience, setAudience] = useState(promotion?.audience ?? "");
  const [targetArea, setTargetArea] = useState(promotion?.targetArea ?? "");
  const [active, setActive] = useState(promotion?.active ?? true);
  const [poster, setPoster] = useState(promotion?.image ?? "");

  const ctaMeta = useMemo(() => CTA_OPTIONS.find((item) => item.id === cta) ?? CTA_OPTIONS[0], [cta]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SmartForm action={savePromotion} submit={promotion ? "Save campaign" : "Publish campaign"} className="grid gap-4">
        <input type="hidden" name="id" value={promotion?.id ?? ""} />

        <section className="panel grid gap-4 p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Campaign</h2>
            <p className="mt-1 text-sm text-stone">What staff see in the desk and what shoppers read first.</p>
          </div>
          <label>
            <span className="label">Internal title</span>
            <input className="field" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Maxi brick promotion" />
          </label>
          <label>
            <span className="label">Headline</span>
            <input className="field" name="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} required placeholder="Maxi bricks, while the promotion holds." />
          </label>
          <label>
            <span className="label">Short description</span>
            <textarea className="field min-h-24" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One or two lines for the card." />
          </label>
        </section>

        <section className="panel grid gap-4 p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Poster</h2>
            <p className="mt-1 text-sm text-stone">Upload a campaign poster or paste a link. Wide images look best.</p>
          </div>
          <ImageField
            initial={promotion?.image ?? ""}
            variant="poster"
            name="image"
            label="Campaign poster"
            onChange={(urls) => setPoster(urls[0] || "")}
          />
        </section>

        <section className="panel grid gap-4 p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Offer</h2>
            <p className="mt-1 text-sm text-stone">Badge and price cue on the card.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Badge / discount</span>
              <input className="field" name="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Yard promotion" />
            </label>
            <label>
              <span className="label">Price label</span>
              <input className="field" name="priceLabel" value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} placeholder="US$0.15 / brick" />
            </label>
          </div>
        </section>

        <section className="panel grid gap-4 p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Call to action</h2>
            <p className="mt-1 text-sm text-stone">{ctaMeta.hint}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {CTA_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition ${
                  cta === option.id ? "border-ink bg-plaster" : "border-line bg-white hover:bg-plaster"
                }`}
              >
                <input
                  type="radio"
                  name="cta"
                  value={option.id}
                  checked={cta === option.id}
                  onChange={() => {
                    setCta(option.id);
                    if (option.id === "quote" && (!ctaHref || ctaHref === "/")) setCtaHref("/quote");
                    if (option.id === "whatsapp") setCtaHref("");
                  }}
                  className="mt-1"
                />
                <span>
                  <span className="block font-bold text-ink">{option.label}</span>
                  <span className="text-xs text-stone">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>
          {cta !== "whatsapp" ? (
            <label>
              <span className="label">Destination link</span>
              <input className="field" name="ctaHref" value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="/quote?product=cbh-maxi-brick" />
            </label>
          ) : (
            <input type="hidden" name="ctaHref" value={ctaHref || "/promotions"} />
          )}
        </section>

        <section className="panel grid gap-4 p-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">Audience & schedule</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Audience</span>
              <input className="field" name="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Home builders" />
            </label>
            <label>
              <span className="label">Target location</span>
              <input className="field" name="targetArea" value={targetArea} onChange={(e) => setTargetArea(e.target.value)} placeholder="Harare" />
            </label>
            <label>
              <span className="label">Expiry date</span>
              <input className="field" type="date" name="expiresAt" defaultValue={promotion?.expiresAt ?? ""} />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-ink">
              <input type="checkbox" name="active" value="yes" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Show on the public site
            </label>
          </div>
        </section>
      </SmartForm>

      <aside className="grid h-fit gap-4 xl:sticky xl:top-24">
        <div className="panel overflow-hidden p-0">
          <div className="border-b border-line bg-plaster px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Live preview</p>
            <p className="text-sm font-extrabold text-ink">How the card reads on the storefront</p>
          </div>
          <div className="p-4">
            <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_20px_rgba(12,60,140,0.04)]">
              <div className="relative aspect-[16/9] bg-[#e8eef8]">
                <Cover src={poster || null} alt="" />
                {!active ? (
                  <span className="absolute left-3 top-3 rounded-full bg-[#10233f]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Hidden
                  </span>
                ) : null}
              </div>
              <div className="p-4">
                {discount ? <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-copper">{discount}</p> : null}
                <h3 className="mt-1 text-[17px] font-extrabold leading-snug text-ink">
                  {headline || "Campaign headline"}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-stone">
                  {description || "Short description for shoppers."}
                </p>
                {(audience || targetArea) ? (
                  <p className="mt-2 text-xs text-stone">
                    {[audience, targetArea].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {priceLabel ? <p className="mt-3 text-sm font-extrabold text-ink">{priceLabel}</p> : null}
                <span className="mt-4 inline-flex text-sm font-bold text-ink">{ctaMeta.label} →</span>
              </div>
            </article>
            <p className="mt-3 text-xs text-stone">
              Preview updates as you type or upload a poster.
            </p>
            {promotion?.slug ? (
              <Link href={`/promotions/${promotion.slug}`} className="mt-3 inline-flex text-sm font-bold text-ink hover:underline" target="_blank">
                Open public page →
              </Link>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
