import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Cover } from "@/components/site/Cover";
import { parseJson } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) return {};
  return { title: project.name, description: project.description };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) notFound();
  const photos = parseJson<string[]>(project.photos, []);
  return (
    <div className="wrap py-12">
      <p className="text-xs uppercase tracking-[0.16em] text-stone">{project.location}</p>
      <h1 className="display mt-2 text-5xl">{project.name}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed">{project.description}</p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
        <div className="panel p-4"><dt className="text-stone">Contractor</dt><dd>{project.contractor || "—"}</dd></div>
        <div className="panel p-4"><dt className="text-stone">Products</dt><dd>{project.products}</dd></div>
        <div className="panel p-4"><dt className="text-stone">Quantity</dt><dd>{project.quantity || "—"}</dd></div>
      </dl>
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {photos.map((photo) => (
          <div key={photo} className="aspect-[4/3] overflow-hidden rounded-[1.4rem]"><Cover src={photo} alt={project.name} /></div>
        ))}
      </div>
    </div>
  );
}
