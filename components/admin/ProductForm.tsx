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
  const images = parseJson<string[]>(product?.images, []).join("\n");
  return (
    <SmartForm action={saveProduct} submit={product ? "Save listing" : "Add listing"} className="grid gap-4">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <section className="panel grid gap-4 p-5">
        <h2 className="text-lg font-extrabold text-ink">Listing</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className="label">Name</span><input className="field" name="name" defaultValue={product?.name} required /></label>
          <label><span className="label">SKU</span><input className="field" name="sku" defaultValue={product?.sku} required /></label>
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
          <label><span className="label">Unit</span><input className="field" name="unit" defaultValue={product?.unit ?? "each"} required /></label>
          <label><span className="label">Minimum order</span><input className="field" name="moq" defaultValue={product?.moq ?? 1} /></label>
        </div>
        <label><span className="label">Description</span><textarea className="field min-h-28" name="description" defaultValue={product?.description} required /></label>
      </section>
      <section className="panel grid gap-4 p-5">
        <h2 className="text-lg font-extrabold text-ink">Price</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className="label">Price (USD)</span><input className="field" name="price" defaultValue={product?.price ?? ""} required /></label>
          <label><span className="label">Sale price</span><input className="field" name="promoPrice" defaultValue={product?.promoPrice ?? ""} placeholder="Leave blank if there is no sale" /></label>
        </div>
      </section>
      <section className="panel grid gap-4 p-5">
        <div>
          <h2 className="text-lg font-extrabold text-ink">Photos</h2>
          <p className="mt-1 text-sm text-stone">Main image is required for a strong listing. Extra photos are optional and appear in the product gallery slider.</p>
        </div>
        <ImageField initial={images} />
      </section>
      <details className="panel p-5">
        <summary className="cursor-pointer text-lg font-extrabold text-ink">Delivery, specs and search</summary>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="label">Weight per unit (kg)</span><input className="field" name="weightKg" defaultValue={product?.weightKg ?? 1} /></label>
            <label><span className="label">Stock quantity</span><input className="field" name="stockQty" defaultValue={product?.stockQty ?? ""} /></label>
            <label><span className="label">Launch date</span><input className="field" name="launchDate" type="date" defaultValue={product?.launchDate ?? ""} /></label>
            <label><span className="label">Related slugs</span><input className="field" name="relatedSlugs" defaultValue={product?.relatedSlugs} /></label>
          </div>
          <label><span className="label">Specifications (Label | Value)</span><textarea className="field min-h-28" name="specsText" defaultValue={specs} /></label>
          <label><span className="label">Tags</span><input className="field" name="tags" defaultValue={product?.tags} placeholder="walls, residential" /></label>
          <label><span className="label">Delivery notes</span><input className="field" name="deliveryNotes" defaultValue={product?.deliveryNotes ?? ""} /></label>
          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="label">Warranty</span><input className="field" name="warranty" defaultValue={product?.warranty ?? ""} /></label>
            <label><span className="label">Datasheet URL</span><input className="field" name="datasheetUrl" defaultValue={product?.datasheetUrl ?? ""} /></label>
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
