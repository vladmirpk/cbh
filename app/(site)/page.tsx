import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/site/Hero";
import { Departments } from "@/components/site/Departments";
import { ProductCard } from "@/components/site/ProductCard";
import { Cover } from "@/components/site/Cover";
import { parseJson } from "@/lib/types";

export default async function HomePage() {
  const [categories, featured, promotions, upcoming] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: true },
      orderBy: { name: "asc" },
      take: 6,
    }),
    prisma.promotion.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.product.findMany({
      where: { active: true, stockStatus: { in: ["coming_soon", "pre_order"] } },
      include: { category: true },
      orderBy: { launchDate: "asc" },
      take: 3,
    }),
  ]);

  return (
    <div className="bg-plaster pb-12">
      <Hero />
      <Departments categories={categories.map((category) => ({ name: category.name, slug: category.slug }))} />

      {featured.length ? (
        <section className="wrap mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Catalogue</p>
              <h2 className="display mt-2 text-4xl text-ink">Featured products</h2>
            </div>
            <Link href="/products" className="btn btn-ghost">Browse all products</Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      ) : null}

      {promotions.length ? (
        <section className="wrap mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Campaigns</p>
              <h2 className="display mt-2 text-4xl text-ink">Promotions</h2>
            </div>
            <Link href="/promotions" className="btn btn-ghost">All promotions</Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {promotions.map((promo) => (
              <Link key={promo.id} href={`/promotions/${promo.slug}`} className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_rgba(12,60,140,0.06)]">
                <div className="relative aspect-[16/10] bg-[#e8eef8]">
                  <Cover src={promo.image} alt={promo.title} />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-copper">{promo.discount || "Offer"}</p>
                  <h3 className="mt-1 text-xl font-extrabold text-ink">{promo.headline}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-stone">{promo.description}</p>
                  <span className="mt-4 inline-flex text-sm font-bold text-ink">{promo.cta} →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {upcoming.length ? (
        <section className="wrap mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Coming soon</p>
              <h2 className="display mt-2 text-4xl text-ink">Coming soon</h2>
            </div>
            <Link href="/upcoming" className="btn btn-ghost">Upcoming products</Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {upcoming.map((product) => {
              const image = parseJson<string[]>(product.images, [])[0];
              return (
                <Link key={product.id} href={`/launch/${product.slug}`} className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_rgba(12,60,140,0.06)]">
                  <div className="relative aspect-[16/10] bg-[#e8eef8]">
                    <Cover src={image} alt={product.name} />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-copper">
                      {product.stockStatus === "pre_order" ? "Pre-order" : "Coming soon"}
                      {product.launchDate ? ` · ${product.launchDate}` : ""}
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold text-ink">{product.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-stone">{product.description}</p>
                    <span className="mt-4 inline-flex text-sm font-bold text-ink">Register interest →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="wrap mt-12 grid gap-4 lg:grid-cols-[0.9fr_1.35fr_0.9fr]">
        <article className="relative min-h-72 overflow-hidden rounded-2xl bg-ink text-white">
          <div className="absolute inset-0 opacity-50">
            <Cover src="https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=800&q=70" alt="" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#08275f] via-[#08275fcc] to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-7">
            <h2 className="text-4xl font-extrabold leading-none">Strong<br />Foundations<br /><span className="text-gold">Last Longer</span></h2>
          </div>
        </article>
        <article className="grid items-center gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm md:grid-cols-[1fr_180px]">
          <div>
            <h2 className="text-3xl font-extrabold text-ink">Our Services</h2>
            <ul className="mt-4 space-y-2 text-sm font-semibold text-[#16325c]">
              {["Bulk Orders & Deliveries", "Construction Support", "Professional Advice", "Project Supply Solutions"].map((item) => (
                <li key={item} className="flex items-center gap-2"><span className="text-[#16a34a]">✔</span>{item}</li>
              ))}
            </ul>
            <Link href="/services" className="mt-5 inline-flex rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">Learn More →</Link>
          </div>
          <HardHat />
        </article>
        <article className="flex min-h-72 flex-col justify-between rounded-2xl bg-ink p-7 text-white">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
            <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden>
              <path d="M8 22 24 8l16 14v16H8Z" fill="none" stroke="#f5c400" strokeWidth="3" />
              <path d="M20 38V26h8v12" fill="none" stroke="#fff" strokeWidth="3" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold leading-none">Your One-Stop<br /><span className="text-gold">Building Partner</span></h2>
            <p className="mt-3 text-sm text-white/80">Price materials and delivery, then submit.</p>
            <Link href="/quote" className="mt-5 inline-flex rounded-full bg-gold px-4 py-2.5 text-sm font-bold text-[#10233f]">Get a Quote →</Link>
          </div>
        </article>
      </section>
    </div>
  );
}

function HardHat() {
  return (
    <svg viewBox="0 0 180 150" className="mx-auto h-36 w-44" aria-hidden>
      <ellipse cx="90" cy="128" rx="58" ry="8" fill="#e8eef8" />
      <rect x="28" y="96" width="124" height="10" rx="2" fill="#d6e2f5" />
      <path d="M36 96c8-40 28-62 54-62s46 22 54 62" fill="#f5c400" />
      <path d="M70 40h40v10H70z" fill="#f8d85a" />
      <rect x="78" y="18" width="24" height="16" rx="3" fill="#f5c400" />
      <path d="M48 108c10 16 26 24 42 24s32-8 42-24" fill="none" stroke="#9eb4d6" strokeWidth="6" />
      <rect x="40" y="112" width="70" height="8" rx="2" fill="#d7e4f7" transform="rotate(-8 75 116)" />
    </svg>
  );
}
