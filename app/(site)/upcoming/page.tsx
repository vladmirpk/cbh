import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import { parseJson, unitPrice } from "@/lib/types";
import { Cover } from "@/components/site/Cover";
import { Countdown } from "@/components/site/Countdown";
import { SmartForm } from "@/components/SmartForm";
import { registerInterest } from "@/lib/actions/public";

export const metadata: Metadata = {
  title: "Upcoming products",
  description: "Register interest in CBH products before they are stocked, including solar and energy systems.",
};

export default async function UpcomingPage() {
  const products = await prisma.product.findMany({
    where: { active: true, stockStatus: { in: ["coming_soon", "pre_order"] } },
    include: { category: true },
    orderBy: { launchDate: "asc" },
  });
  return (
    <div className="wrap py-12">
      <p className="text-xs uppercase tracking-[0.18em] text-stone">Coming soon</p>
      <h1 className="display mt-2 max-w-3xl text-5xl">Upcoming products</h1>
      <p className="mt-3 max-w-xl text-stone">Register interest with quantity and location.</p>
      <div className="mt-10 grid gap-8">
        {products.map((product) => (
          <article key={product.id} className="grid overflow-hidden rounded-[1.6rem] border border-line bg-card md:grid-cols-2">
            <div className="min-h-64"><Cover src={parseJson<string[]>(product.images, [])[0]} alt={product.name} /></div>
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-brick">{product.stockStatus === "pre_order" ? "Pre-order" : "Coming soon"}</p>
              <h2 className="display mt-2 text-4xl leading-none">{product.name}</h2>
              <p className="mt-3 text-stone">{product.description}</p>
              <p className="mt-3 font-semibold">Indicative {money(unitPrice(product))} / {product.unit}</p>
              {product.launchDate ? <div className="mt-4"><Countdown date={product.launchDate} /></div> : null}
              <Link href={`/launch/${product.slug}`} className="mt-4 inline-block text-sm font-semibold text-brick">Open the launch page</Link>
            </div>
          </article>
        ))}
      </div>
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="display text-4xl">Register interest</h2>
          <p className="mt-2 text-stone">Fill the form. Sales will follow up.</p>
        </div>
        <div className="panel p-5">
          <SmartForm
            action={registerInterest}
            submit="Register"
            confirm={{
              title: "Register interest?",
              message: "Sales will contact you when stock moves.",
              confirmLabel: "Register",
              cancelLabel: "Back",
            }}
          >
            <input type="hidden" name="source" value="upcoming" />
            <label>
              <span className="label">Product</span>
              <select className="field" name="productId" required>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="label">Name</span><input className="field" name="name" required /></label>
              <label><span className="label">Phone</span><input className="field" name="phone" required /></label>
              <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" /></label>
              <label><span className="label">Email</span><input className="field" name="email" type="email" /></label>
              <label><span className="label">Location</span><input className="field" name="location" required /></label>
              <label><span className="label">Estimated quantity</span><input className="field" name="quantity" /></label>
            </div>
            <label><span className="label">Additional requirements</span><textarea className="field min-h-24" name="requirements" /></label>
          </SmartForm>
        </div>
      </section>
    </div>
  );
}
