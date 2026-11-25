import { SmartForm } from "@/components/SmartForm";
import { ImageField } from "@/components/admin/ImageField";
import { saveProduct } from "@/lib/actions/admin";
import { PRODUCT_STATUSES, parseJson, type Spec } from "@/lib/types";

type ProductInput = {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  unit: string;
  price: number;
  promoPrice: number | null;
  moq: number;
  weightKg: number;
  stockStatus: string;
  stockQty: number | null;
  deliveryNotes: string | null;
  brand: string | null;
  modelNumber: string | null;
  barcode: string | null;
  colour: string | null;
  sizeLabel: string | null;
  packSize: string | null;
  leadTimeDays: number | null;
  leadTimeNote: string | null;
  useCase: string | null;
  features: string;
  tags: string;
  images: string;
  specs: string;
  relatedSlugs: string;
  warranty: string | null;
  datasheetUrl: string | null;
  installRequired: boolean;
  launchDate: string | null;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  active: boolean;
};

export function ProductForm({
  product,
  categories,
}: {
  product?: ProductInput | null;
  categories: { id: string; name: string }[];
}) {
  const specs = parseJson<Spec[]>(product?.specs, [])
    .map((spec) => `${spec.label} | ${spec.value}`)
    .join("\n");
  const features = parseJson<string[]>(product?.features, []).join("\n");
  const images = parseJson<string[]>(product?.images, []).join("\n");
  return (
    <SmartForm action={saveProduct} submit={product ? "Save listing" : "Add listing"} className="grid gap-4">
      <input type="hidden" name="id" value={product?.id ?? ""} />

      <section className="panel grid gap-4 p-5">
        <h2 className="text-lg font-extrabold text-ink">Listing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2"><span className="label">Name</span><input className="field" name="name" defaultValue={product?.name} required /></label>
          <label><span className="label">SKU / product code</span><input className="field" name="sku" defaultValue={product?.sku} required /></label>
          <label><span className="label">Model number</span><input className="field" name="modelNumber" defaultValue={product?.modelNumber ?? ""} placeholder="Manufacturer model" /></label>
          <label><span className="label">Barcode / EAN</span><input className="field" name="barcode" defaultValue={product?.barcode ?? ""} /></label>
          <label><span className="label">Brand</span><input className="field" name="brand" defaultValue={product?.brand ?? ""} placeholder="CBH" /></label>
          <label>
            <span className="label">Category</span>
            <select className="field" name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Status</span>
            <select className="field" name="stockStatus" defaultValue={product?.stockStatus ?? "available"}>
              {PRODUCT_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
            </select>
          </label>
          <label><span className="label">Unit (UOM)</span><input className="field" name="unit" defaultValue={product?.unit ?? "each"} required /></label>
          <label><span className="label">Minimum order</span><input className="field" name="moq" defaultValue={product?.moq ?? 1} /></label>
        </div>
      </section>

      <section className="panel grid gap-4 p-5">
        <h2 className="text-lg font-extrabold text-ink">Appearance & pack</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label><span className="label">Colour / finish</span><input className="field" name="colour" defaultValue={product?.colour ?? ""} placeholder="Grey, terracotta…" /></label>
          <label><span className="label">Size</span><input className="field" name="sizeLabel" defaultValue={product?.sizeLabel ?? ""} placeholder="60 mm, 25 kg, 320 mm" /></label>
          <label><span className="label">Pack size</span><input className="field" name="packSize" defaultValue={product?.packSize ?? ""} placeholder="50 kg bag, pack of 10" /></label>
        </div>
      </section>

      <section className="panel grid gap-4 p-5">
        <h2 className="text-lg font-extrabold text-ink">Price & stock</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className="label">Price (USD)</span><input className="field" name="price" defaultValue={product?.price ?? ""} required /></label>
          <label><span className="label">Sale price</span><input className="field" name="promoPrice" defaultValue={product?.promoPrice ?? ""} placeholder="Leave blank if no sale" /></label>
          <label><span className="label">Stock quantity (yard)</span><input className="field" name="stockQty" defaultValue={product?.stockQty ?? ""} /></label>
          <label><span className="label">Launch date</span><input className="field" name="launchDate" type="date" defaultValue={product?.launchDate ?? ""} /></label>
          <label><span className="label">Lead time (days)</span><input className="field" name="leadTimeDays" defaultValue={product?.leadTimeDays ?? ""} placeholder="e.g. 5" /></label>
          <label><span className="label">Lead time note</span><input className="field" name="leadTimeNote" defaultValue={product?.leadTimeNote ?? ""} placeholder="3–6 working days" /></label>
        </div>
      </section>

      <section className="panel grid gap-4 p-5">
        <h2 className="text-lg font-extrabold text-ink">Copy</h2>
        <label><span className="label">Short description</span><textarea className="field min-h-24" name="description" defaultValue={product?.description} required /></label>
        <label><span className="label">What it’s used for</span><textarea className="field min-h-20" name="useCase" defaultValue={product?.useCase ?? ""} placeholder="How contractors and homeowners use this item" /></label>
        <label>
          <span className="label">Key features (one per line)</span>
          <textarea className="field min-h-24" name="featuresText" defaultValue={features} placeholder="Consistent colour&#10;Sold per brick for easy quoting" />
        </label>
        <label><span className="label">Tags</span><input className="field" name="tags" defaultValue={product?.tags} placeholder="walls, residential" /></label>
      </section>

      <section className="panel grid gap-4 p-5">
        <div>
          <h2 className="text-lg font-extrabold text-ink">Photos</h2>
          <p className="mt-1 text-sm text-stone">Main image first. Extra photos appear in the gallery.</p>
        </div>
        <ImageField initial={images} />
      </section>

      <details className="panel p-5" open>
        <summary className="cursor-pointer text-lg font-extrabold text-ink">Specs & logistics</summary>
        <div className="mt-4 grid gap-4">
          <label>
            <span className="label">Technical specifications (Label | Value)</span>
            <textarea className="field min-h-28" name="specsText" defaultValue={specs} placeholder="Wattage | 100 W&#10;IP rating | IP65" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="label">Weight per unit (kg)</span><input className="field" name="weightKg" defaultValue={product?.weightKg ?? 1} /></label>
            <label><span className="label">Related slugs</span><input className="field" name="relatedSlugs" defaultValue={product?.relatedSlugs} /></label>
            <label><span className="label">Warranty</span><input className="field" name="warranty" defaultValue={product?.warranty ?? ""} /></label>
            <label><span className="label">Datasheet URL</span><input className="field" name="datasheetUrl" defaultValue={product?.datasheetUrl ?? ""} /></label>
          </div>
          <label><span className="label">Delivery notes</span><input className="field" name="deliveryNotes" defaultValue={product?.deliveryNotes ?? ""} /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="label">SEO title</span><input className="field" name="seoTitle" defaultValue={product?.seoTitle ?? ""} /></label>
            <label><span className="label">SEO description</span><input className="field" name="seoDescription" defaultValue={product?.seoDescription ?? ""} /></label>
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" value="yes" defaultChecked={product?.featured} /> Featured</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="installRequired" value="yes" defaultChecked={product?.installRequired} /> Installation required</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="active" value="yes" defaultChecked={product?.active ?? true} /> Visible on the site</label>
      </div>
    </SmartForm>
  );
}
