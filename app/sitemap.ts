import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [products, categories, posts, projects, promotions] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, select: { slug: true } }),
    prisma.category.findMany({ where: { active: true }, select: { slug: true } }),
    prisma.post.findMany({ where: { published: true }, select: { slug: true } }),
    prisma.project.findMany({ select: { slug: true } }),
    prisma.promotion.findMany({ where: { active: true }, select: { slug: true } }),
  ]);
  const staticPaths = ["", "/about", "/products", "/upcoming", "/promotions", "/projects", "/delivery", "/quote", "/contact", "/blog"];
  return [
    ...staticPaths.map((path) => ({ url: `${base}${path || "/"}` })),
    ...products.map((item) => ({ url: `${base}/products/${item.slug}` })),
    ...products.map((item) => ({ url: `${base}/launch/${item.slug}` })),
    ...categories.map((item) => ({ url: `${base}/categories/${item.slug}` })),
    ...posts.map((item) => ({ url: `${base}/blog/${item.slug}` })),
    ...projects.map((item) => ({ url: `${base}/projects/${item.slug}` })),
    ...promotions.map((item) => ({ url: `${base}/promotions/${item.slug}` })),
  ];
}
