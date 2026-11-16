import type { Metadata } from "next";
import { getCommerce } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "About CBH",
  description: "Consolidated Bricks & Hardware is a Zimbabwean materials business building a digital sales desk around bricks, pavers and new product lines.",
};

export default async function AboutPage() {
  const { site } = await getCommerce();
  const [products, zones, categories] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.zone.count({ where: { active: true } }),
    prisma.category.count({ where: { active: true } }),
  ]);
  return (
    <div>
      <section className="bg-ink text-plaster">
        <div className="wrap py-16 md:py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-[#f5c400]">About the company</p>
          <h1 className="display mt-4 max-w-4xl text-5xl leading-[0.95] md:text-7xl">Not a brochure. The front door of the sales operation.</h1>
        </div>
      </section>
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-4 text-lg leading-relaxed">
          {site.about.split(/\n\n+/).map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            [String(categories), "Categories"],
            [String(products), "Products"],
            [String(zones), "Delivery zones"],
          ].map(([value, label]) => (
            <div key={label} className="panel p-4">
              <p className="display text-4xl">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-stone">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <section className="wrap grid gap-4 pb-8 md:grid-cols-3">
        {[
          ["Category led", "Solar, lighting and landscaping sit beside bricks. Adding a line is a catalogue change."],
          ["Quote before the call", "A customer can leave with a provisional materials and delivery figure, and CBH keeps the lead."],
          ["The desk stays in the open", "Roles cover management, sales, marketing and operations. Customer data exports as CSV."],
        ].map(([title, copy]) => (
          <article key={title} className="rounded-[1.4rem] bg-olive p-6 text-plaster">
            <h2 className="display text-3xl">{title}</h2>
            <p className="mt-3 text-sm text-[#e7efe9]">{copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
