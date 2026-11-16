import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money, waLink } from "@/lib/format";
import { parseJson, type Spec, unitPrice } from "@/lib/types";
import { getCommerce } from "@/lib/queries";
import { Cover } from "@/components/site/Cover";
import { Countdown } from "@/components/site/Countdown";
import { SmartForm } from "@/components/SmartForm";
import { registerInterest } from "@/lib/actions/public";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return { title: product.seoTitle || `${product.name} launching`, description: product.seoDescription || product.description };
}

export default async function LaunchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
  if (!product || !product.active) notFound();
  const { site } = await getCommerce();
  const image = parseJson<string[]>(product.images, [])[0];
  const specs = parseJson<Spec[]>(product.specs, []);
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/launch/${product.slug}`;
  const text = `${product.name} — register interest with CBH`;
  return (
    <div>
      <section className="bg-ink text-plaster">
        <div className="wrap grid items-center gap-8 py-16 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#f5c400]">New product · {product.category.name}</p>
            <h1 className="display mt-3 text-5xl leading-none md:text-6xl">{product.name}</h1>
            <p className="mt-4 text-lg text-white/85">{product.description}</p>
            {product.launchDate ? <div className="mt-6"><Countdown date={product.launchDate} /></div> : null}
            <p className="mt-4 text-sm">Indicative price {money(unitPrice(product))} / {product.unit}</p>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-[1.6rem]"><Cover src={image} alt={product.name} /></div>
        </div>
      </section>
      <div className="wrap grid gap-8 py-12 lg:grid-cols-[1fr_.8fr]">
        <div>
          {specs.length ? (
            <table className="w-full text-sm">
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.label} className="border-t border-line">
                    <th className="py-3 text-left font-medium text-stone">{spec.label}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <a className="btn btn-ghost" href={waLink(site.whatsapp, `Hello CBH, I want to register interest in ${product.name}.`)}>WhatsApp enquiry</a>
            <a className="btn btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`}>Share</a>
            <a className="btn btn-ghost" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}>Facebook</a>
            <Link className="btn btn-ghost" href={`/products/${product.slug}`}>Product details</Link>
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="display text-3xl">Register interest</h2>
          <div className="mt-4">
            <SmartForm action={registerInterest} submit="Register interest">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="source" value="launch" />
              <label><span className="label">Name</span><input className="field" name="name" required /></label>
              <label><span className="label">Phone</span><input className="field" name="phone" required /></label>
              <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" /></label>
              <label><span className="label">Email</span><input className="field" name="email" type="email" /></label>
              <label><span className="label">Location</span><input className="field" name="location" required /></label>
              <label><span className="label">Estimated quantity</span><input className="field" name="quantity" /></label>
              <label><span className="label">Additional requirements</span><textarea className="field min-h-24" name="requirements" /></label>
            </SmartForm>
          </div>
        </div>
      </div>
    </div>
  );
}
