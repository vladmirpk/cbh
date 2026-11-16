import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { saveCategory } from "@/lib/actions/admin";

export default async function CategoriesAdmin({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireUser();
  if (!canManageContent(user.role)) return <Denied />;
  const { id } = await searchParams;
  const [items, current] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    id ? prisma.category.findUnique({ where: { id } }) : null,
  ]);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <SmartForm action={saveCategory} submit="Save category">
        <h1 className="display text-4xl">Categories</h1>
        <input type="hidden" name="id" value={current?.id ?? ""} />
        <label><span className="label">Name</span><input className="field" name="name" defaultValue={current?.name} required /></label>
        <label><span className="label">Description</span><textarea className="field" name="description" defaultValue={current?.description} /></label>
        <label><span className="label">Image URL</span><input className="field" name="image" defaultValue={current?.image ?? ""} /></label>
        <label><span className="label">Sort</span><input className="field" name="sortOrder" defaultValue={current?.sortOrder ?? 0} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={current?.active ?? true} /> Visible</label>
      </SmartForm>
      <ul className="grid content-start gap-2 text-sm">{items.map((item) => <li key={item.id}><a href={`/admin/categories?id=${item.id}`}>{item.name}</a></li>)}</ul>
    </div>
  );
}
