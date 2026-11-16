import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Cover } from "@/components/site/Cover";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();
  return (
    <article className="wrap max-w-3xl py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-stone">{formatDate(post.createdAt)}</p>
      <h1 className="display mt-3 text-5xl leading-none">{post.title}</h1>
      <p className="mt-4 text-lg text-stone">{post.excerpt}</p>
      {post.image ? <div className="mt-6 aspect-[16/9] overflow-hidden rounded-[1.4rem]"><Cover src={post.image} alt="" /></div> : null}
      <div className="mt-8 space-y-4 text-lg leading-relaxed">
        {post.body.split(/\n\n+/).map((paragraph) => <p key={paragraph.slice(0, 32)}>{paragraph}</p>)}
      </div>
    </article>
  );
}
