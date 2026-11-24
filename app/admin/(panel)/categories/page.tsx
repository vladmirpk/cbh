import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { deleteCategory, saveCategory } from "@/lib/actions/admin";

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
      <div>
        <SmartForm action={saveCategory} submit="Save category">
          <h1 className="display text-4xl">{current ? "Edit category" : "Categories"}</h1>
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <label><span className="label">Name</span><input className="field" name="name" defaultValue={current?.name} required /></label>
          <label><span className="label">Description</span><textarea className="field" name="description" defaultValue={current?.description} /></label>
          <label><span className="label">Image URL</span><input className="field" name="image" defaultValue={current?.image ?? ""} /></label>
          <label><span className="label">Sort</span><input className="field" name="sortOrder" defaultValue={current?.sortOrder ?? 0} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={current?.active ?? true} /> Visible</label>
        </SmartForm>
        {current ? (
          <form action={deleteCategory} className="mt-4">
            <input type="hidden" name="id" value={current.id} />
            <button className="btn btn-ghost text-[#b42318]" type="submit">Delete or hide category</button>
          </form>
        ) : null}
        {current ? <p className="mt-3 text-sm"><Link href="/admin/categories">Clear form</Link></p> : null}
      </div>
      <ul className="grid content-start gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="panel flex items-center justify-between gap-3 p-3">
            <div>
              <Link href={`/admin/categories?id=${item.id}`} className="font-semibold">{item.name}</Link>
              <p className="text-stone">{item.active ? "Visible" : "Hidden"} · sort {item.sortOrder}</p>
            </div>
            <Link href={`/admin/categories?id=${item.id}`} className="text-xs">Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
