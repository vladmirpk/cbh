import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageContent } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { deletePost, savePost } from "@/lib/actions/admin";
import { RowActions } from "@/components/admin/RowActions";
import { PreviewSheet } from "@/components/admin/PreviewSheet";
import { ConfirmAction } from "@/components/admin/ConfirmAction";

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
      <div>
        <SmartForm
          action={savePost}
          submit="Save article"
          confirm={
            current
              ? {
                  title: `Save changes to this article?`,
                  message: "Published articles update on the journal immediately.",
                  detail: current.title,
                  confirmLabel: "Save article",
                  cancelLabel: "Keep editing",
                }
              : undefined
          }
        >
          <h1 className="display text-4xl">{current ? "Edit article" : "Journal"}</h1>
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <label><span className="label">Title</span><input className="field" name="title" defaultValue={current?.title} required /></label>
          <label><span className="label">Excerpt</span><textarea className="field" name="excerpt" defaultValue={current?.excerpt} /></label>
          <label><span className="label">Body</span><textarea className="field min-h-48" name="body" defaultValue={current?.body} /></label>
          <label><span className="label">Image URL</span><input className="field" name="image" defaultValue={current?.image ?? ""} /></label>
          <label>
            <span className="label">Kind</span>
            <select className="field" name="kind" defaultValue={current?.kind ?? "news"}>
              <option value="news">News</option>
              <option value="blog">Blog</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" value="yes" defaultChecked={current?.published ?? true} /> Published</label>
        </SmartForm>
        {current ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ConfirmAction
              action={deletePost}
              fields={{ id: current.id }}
              label="Delete article"
              confirm={{
                title: `Delete “${current.title}”?`,
                message: "This removes the article from the journal permanently.",
                confirmLabel: "Delete article",
                cancelLabel: "Keep article",
                tone: "danger",
              }}
            />
            <Link href="/admin/posts" className="text-sm font-bold text-ink hover:underline">New article</Link>
          </div>
        ) : null}
      </div>
      <ul className="grid content-start gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className="panel flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <p className="font-semibold text-ink">{item.title}</p>
              <p className="text-stone">{item.published ? "Published" : "Draft"} · {item.kind}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <PreviewSheet
                title={item.title}
                editHref={`/admin/posts?id=${item.id}`}
                previewHref={`/blog/${item.slug}`}
                lines={[
                  { label: "Kind", value: item.kind },
                  { label: "Status", value: item.published ? "Published" : "Draft" },
                  { label: "Excerpt", value: item.excerpt || "—" },
                ]}
              />
              <RowActions
                previewHref={`/blog/${item.slug}`}
                previewLabel="Live"
                previewExternal
                editHref={`/admin/posts?id=${item.id}`}
                deleteAction={deletePost}
                deleteFields={{ id: item.id }}
                deleteConfirm={{
                  title: `Delete “${item.title}”?`,
                  message: "This removes the article from the journal permanently.",
                  confirmLabel: "Delete article",
                  cancelLabel: "Keep article",
                  tone: "danger",
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
