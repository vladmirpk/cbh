import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Cover } from "@/components/site/Cover";

export const metadata: Metadata = { title: "Journal", description: "News and notes from Consolidated Bricks & Hardware." };

export default async function BlogPage() {
  const posts = await prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="wrap py-12">
      <h1 className="display text-5xl">Journal</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="overflow-hidden rounded-[1.4rem] border border-line bg-card">
            <div className="aspect-[16/10]"><Cover src={post.image} alt="" /></div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-stone">{post.kind} · {formatDate(post.createdAt)}</p>
              <h2 className="display mt-2 text-2xl">{post.title}</h2>
              <p className="mt-2 text-sm text-stone">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
