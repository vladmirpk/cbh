import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { savePost } from "@/lib/actions/admin";

export default async function PostsAdmin({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireUser();
  if (!canManageContent(user.role)) return <Denied />;
  const { id } = await searchParams;
  const [items, current] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "desc" } }),
    id ? prisma.post.findUnique({ where: { id } }) : null,
  ]);
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <SmartForm action={savePost} submit="Save article">
        <h1 className="display text-4xl">Journal</h1>
        <input type="hidden" name="id" value={current?.id ?? ""} />
        <label><span className="label">Title</span><input className="field" name="title" defaultValue={current?.title} required /></label>
        <label><span className="label">Excerpt</span><textarea className="field" name="excerpt" defaultValue={current?.excerpt} /></label>
        <label><span className="label">Body</span><textarea className="field min-h-48" name="body" defaultValue={current?.body} /></label>
        <label><span className="label">Image URL</span><input className="field" name="image" defaultValue={current?.image ?? ""} /></label>
        <label><span className="label">Kind</span><select className="field" name="kind" defaultValue={current?.kind ?? "news"}><option value="news">News</option><option value="blog">Blog</option></select></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" value="yes" defaultChecked={current?.published ?? true} /> Published</label>
      </SmartForm>
      <ul className="grid content-start gap-2 text-sm">{items.map((item) => <li key={item.id}><a href={`/admin/posts?id=${item.id}`}>{item.title}</a></li>)}</ul>
    </div>
  );
}
