import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCommerce } from "@/lib/queries";
import { formatQty, money, waLink } from "@/lib/format";
import { parseJson, type Spec, unitPrice } from "@/lib/types";
import { StatusPill } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { sendEnquiry } from "@/lib/actions/public";
import { ProductCard } from "@/components/site/ProductCard";
import { AddToCart } from "@/components/site/AddToCart";
import { ProductGallery } from "@/components/site/ProductGallery";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: product.seoTitle || `${product.name} in Harare`,
    description: product.seoDescription || product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
  if (!product || !product.active) notFound();
  const productId = product.id;
  after(() => {
    prisma.product.update({ where: { id: productId }, data: { views: { increment: 1 } } }).catch(() => undefined);
  });
  const { site } = await getCommerce();
  const images = parseJson<string[]>(product.images, []);
  const specs = parseJson<Spec[]>(product.specs, []);
  const price = unitPrice(product);
  const relatedSlugs = product.relatedSlugs.split(",").map((item) => item.trim()).filter(Boolean);
  const related = relatedSlugs.length
    ? await prisma.product.findMany({ where: { slug: { in: relatedSlugs }, active: true }, include: { category: true } })
    : [];
  const wa = waLink(site.whatsapp, `Hello CBH, I am interested in ${product.name} (${product.sku}) and would like a delivery quotation.`);
  const launchable = ["coming_soon", "pre_order"].includes(product.stockStatus);
  return (
    <div className="wrap py-12">
      <p className="text-sm text-stone"><Link href="/products">Yard</Link> / <Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link></p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <ProductGallery images={images} alt={product.name} />
        <div>
          <StatusPill status={product.stockStatus} />
          <h1 className="display mt-3 text-5xl leading-none">{product.name}</h1>
          <p className="mt-2 text-sm text-stone">{product.sku} · sold per {product.unit} · minimum {formatQty(product.moq)}</p>
          <p className="mt-5 text-3xl font-semibold">
            {product.stockStatus === "promotional" && product.promoPrice != null ? (
              <span className="mr-2 text-lg font-normal text-stone line-through">{money(product.price)}</span>
            ) : null}
            {money(price)} <span className="text-base font-normal text-stone">/ {product.unit}</span>
          </p>
          {launchable && product.launchDate ? <p className="mt-2 text-sm text-copper">Expected launch {product.launchDate}</p> : null}
          <p className="mt-5 leading-relaxed text-stone">{product.description}</p>
          {product.deliveryNotes ? <p className="mt-3 text-sm">{product.deliveryNotes}</p> : null}
          {product.warranty ? <p className="mt-2 text-sm">Warranty: {product.warranty}</p> : null}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/quote?product=${product.slug}`} className="btn btn-primary">Provisional quote</Link>
            <AddToCart slug={product.slug} name={product.name} image={images[0]} />
            <a href={wa} className="btn btn-ink" target="_blank" rel="noreferrer">Ask on WhatsApp</a>
            {launchable ? <Link href={`/launch/${product.slug}`} className="btn btn-ghost">Launch page</Link> : null}
          </div>
          {specs.length ? (
            <table className="mt-8 w-full text-sm">
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.label} className="border-t border-line">
                    <th className="py-2 pr-4 text-left font-medium text-stone">{spec.label}</th>
                    <td className="py-2">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {product.datasheetUrl ? <a className="mt-3 inline-block text-sm font-semibold text-brick" href={product.datasheetUrl}>Download datasheet</a> : null}
        </div>
      </div>
      <section className="mt-12 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <h2 className="display text-4xl">Request a quote</h2>
          <p className="mt-2 text-sm text-stone">Or <Link href={`/quote?product=${product.slug}`} className="font-semibold text-ink">price with delivery</Link>.</p>
        </div>
        <div className="panel p-5">
          <SmartForm
            action={sendEnquiry}
            submit="Send"
            confirm={{
              title: "Send enquiry?",
              message: product.name,
              image: images[0],
              confirmLabel: "Send",
              cancelLabel: "Back",
            }}
          >
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="source" value="website" />
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="label">Name</span><input className="field" name="name" required /></label>
              <label><span className="label">Phone</span><input className="field" name="phone" required /></label>
              <label><span className="label">WhatsApp</span><input className="field" name="whatsapp" /></label>
              <label><span className="label">Email</span><input className="field" name="email" type="email" /></label>
              <label><span className="label">Quantity</span><input className="field" name="quantity" defaultValue={product.moq} /></label>
              <label><span className="label">Delivery location</span><input className="field" name="location" /></label>
              <label><span className="label">Date required</span><input className="field" name="requiredDate" type="date" /></label>
            </div>
            <label><span className="label">Requirements</span><textarea className="field min-h-24" name="requirements" /></label>
          </SmartForm>
        </div>
      </section>
      {related.length ? (
        <section className="mt-14">
          <h2 className="display text-4xl">Often ordered with this</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            sku: product.sku,
            description: product.description,
            category: product.category.name,
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: price,
              availability: product.stockStatus === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            },
          }),
        }}
      />
    </div>
  );
}
