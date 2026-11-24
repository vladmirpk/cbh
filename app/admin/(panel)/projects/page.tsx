import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { deleteProject, saveProject } from "@/lib/actions/admin";
import { parseJson } from "@/lib/types";

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireUser();
  if (!canManageContent(user.role)) return <Denied />;
  const { id } = await searchParams;
  const [items, current] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
    id ? prisma.project.findUnique({ where: { id } }) : null,
  ]);
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <SmartForm action={saveProject} submit="Save project">
          <h1 className="display text-4xl">{current ? current.name : "New project"}</h1>
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <label><span className="label">Name</span><input className="field" name="name" defaultValue={current?.name} required /></label>
          <label><span className="label">Location</span><input className="field" name="location" defaultValue={current?.location} required /></label>
          <label><span className="label">Contractor</span><input className="field" name="contractor" defaultValue={current?.contractor ?? ""} /></label>
          <label><span className="label">Products supplied</span><textarea className="field" name="products" defaultValue={current?.products} /></label>
          <label><span className="label">Quantity</span><input className="field" name="quantity" defaultValue={current?.quantity ?? ""} /></label>
          <label><span className="label">Description</span><textarea className="field min-h-24" name="description" defaultValue={current?.description} /></label>
          <label><span className="label">Photo URLs</span><textarea className="field min-h-20" name="photos" defaultValue={parseJson<string[]>(current?.photos, []).join("\n")} /></label>
          <label>
            <span className="label">Status</span>
            <select className="field" name="status" defaultValue={current?.status ?? "completed"}>
              <option value="completed">Completed</option>
              <option value="in_progress">In progress</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" value="yes" defaultChecked={current?.featured} /> Show on the home page</label>
        </SmartForm>
        {current ? (
          <form action={deleteProject} className="mt-4">
            <input type="hidden" name="id" value={current.id} />
            <button className="btn btn-ghost text-[#b42318]" type="submit">Delete project</button>
          </form>
        ) : null}
        {current ? <p className="mt-3 text-sm"><Link href="/admin/projects">New project</Link></p> : null}
      </div>
      <ul className="grid content-start gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="panel flex items-center justify-between gap-3 p-3">
            <div>
              <Link href={`/admin/projects?id=${item.id}`} className="font-semibold">{item.name}</Link>
              <p className="text-stone">{item.location}</p>
            </div>
            <Link href={`/admin/projects?id=${item.id}`} className="text-xs">Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
