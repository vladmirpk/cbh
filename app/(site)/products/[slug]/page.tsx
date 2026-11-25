import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCommerce } from "@/lib/queries";
import { formatQty, money, waLink } from "@/lib/format";
import { availabilitySchema, canQuoteStatus, parseJson, type Spec, unitPrice } from "@/lib/types";
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
  const features = parseJson<string[]>(product.features, []);
  const price = unitPrice(product);
  const relatedSlugs = product.relatedSlugs.split(",").map((item) => item.trim()).filter(Boolean);
  const related = relatedSlugs.length
    ? await prisma.product.findMany({ where: { slug: { in: relatedSlugs }, active: true }, include: { category: true } })
    : [];
  const wa = waLink(site.whatsapp, `Hello CBH, I am interested in ${product.name} (${product.sku}) and would like a delivery quotation.`);
  const launchable = ["coming_soon", "pre_order"].includes(product.stockStatus);

  const identity = [
    product.sku,
    product.brand,
    product.modelNumber ? `Model ${product.modelNumber}` : null,
  ].filter(Boolean).join(" · ");

  const coreSpecs: Spec[] = [
    product.brand ? { label: "Brand", value: product.brand } : null,
    product.modelNumber ? { label: "Model", value: product.modelNumber } : null,
    product.barcode ? { label: "Barcode", value: product.barcode } : null,
    product.colour ? { label: "Colour / finish", value: product.colour } : null,
    product.sizeLabel ? { label: "Size", value: product.sizeLabel } : null,
    product.packSize ? { label: "Pack size", value: product.packSize } : null,
    { label: "Unit", value: product.unit },
    { label: "Minimum order", value: `${formatQty(product.moq)} ${product.unit}` },
    product.weightKg ? { label: "Weight per unit", value: `${product.weightKg} kg` } : null,
    product.warranty ? { label: "Warranty", value: product.warranty } : null,
  ].filter(Boolean) as Spec[];

  const seen = new Set(coreSpecs.map((spec) => spec.label.toLowerCase()));
  const mergedSpecs = [
    ...coreSpecs,
    ...specs.filter((spec) => !seen.has(spec.label.toLowerCase())),
  ];

  const stockLine =
    product.stockQty != null && ["available", "promotional"].includes(product.stockStatus)
      ? `${formatQty(product.stockQty)} in yard`
      : product.leadTimeNote
        ? product.leadTimeNote
        : product.leadTimeDays
          ? `Available on order · ~${product.leadTimeDays} days`
          : launchable && product.launchDate
            ? `Expected ${product.launchDate}`
            : null;

  return (
    <div className="wrap py-10">
      <p className="text-sm text-stone">
        <Link href="/products">Yard</Link> / <Link href={`/categories/${product.category.slug}`}>{product.category.name}</Link>
      </p>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <ProductGallery images={images} alt={product.name} />
        <div>
          <StatusPill status={product.stockStatus} />
          <h1 className="display mt-3 text-4xl leading-none sm:text-5xl">{product.name}</h1>
          <p className="mt-2 text-sm text-stone">{identity}</p>
          <p className="mt-4 text-3xl font-semibold">
            {product.stockStatus === "promotional" && product.promoPrice != null ? (
              <span className="mr-2 text-lg font-normal text-stone line-through">{money(product.price)}</span>
            ) : null}
            {money(price)} <span className="text-base font-normal text-stone">/ {product.unit}</span>
          </p>
          <p className="mt-2 text-sm text-stone">
            Sold per {product.unit} · minimum {formatQty(product.moq)}
            {stockLine ? ` · ${stockLine}` : ""}
          </p>
          <p className="mt-5 leading-relaxed text-stone">{product.description}</p>
          {product.deliveryNotes ? <p className="mt-3 text-sm text-stone">{product.deliveryNotes}</p> : null}
          {product.installRequired ? <p className="mt-2 text-sm font-semibold text-ink">Installation required</p> : null}
          {product.tags ? (
            <p className="mt-3 flex flex-wrap gap-2 text-xs">
              {product.tags.split(/[, ]+/).filter(Boolean).map((tag) => (
                <Link key={tag} href={`/products?tag=${encodeURIComponent(tag)}`} className="rounded-full border border-line px-2 py-1 text-stone">{tag}</Link>
              ))}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {canQuoteStatus(product.stockStatus) ? (
              <Link href={`/quote?product=${product.slug}`} className="btn btn-primary">Provisional quote</Link>
            ) : null}
            {canQuoteStatus(product.stockStatus) ? <AddToCart slug={product.slug} name={product.name} image={images[0]} /> : null}
            <a href={wa} className="btn btn-ink" target="_blank" rel="noreferrer">Ask on WhatsApp</a>
            {launchable ? <Link href={`/launch/${product.slug}`} className="btn btn-ghost">Launch page</Link> : null}
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <h2 className="display text-3xl">Specifications</h2>
          <table className="mt-4 w-full text-sm">
            <tbody>
              {mergedSpecs.map((spec) => (
                <tr key={spec.label} className="border-t border-line">
                  <th className="py-2.5 pr-4 text-left font-medium text-stone">{spec.label}</th>
                  <td className="py-2.5 font-semibold text-ink">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {product.datasheetUrl ? (
            <a className="mt-3 inline-block text-sm font-semibold text-brick" href={product.datasheetUrl}>Download datasheet</a>
          ) : null}
        </section>

        <section className="lg:col-span-1">
          <h2 className="display text-3xl">What it’s used for</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone">
            {product.useCase || product.description}
          </p>
        </section>

        <section className="lg:col-span-1">
          <h2 className="display text-3xl">Key features</h2>
          {features.length ? (
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-stone">Ask the desk for the full technical brief on this line.</p>
          )}
        </section>
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <h2 className="display text-4xl">Request a quote</h2>
          <p className="mt-2 text-sm text-stone">
            Or <Link href={`/quote?product=${product.slug}`} className="font-semibold text-ink">price with delivery</Link>.
          </p>
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
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
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
            mpn: product.modelNumber || undefined,
            gtin: product.barcode || undefined,
            description: product.description,
            category: product.category.name,
            brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
            color: product.colour || undefined,
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price,
              availability: availabilitySchema(product.stockStatus),
            },
          }),
        }}
      />
    </div>
  );
}
