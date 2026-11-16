import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Cover } from "@/components/site/Cover";
import { parseJson } from "@/lib/types";

export const metadata: Metadata = { title: "Projects", description: "Sites supplied by Consolidated Bricks & Hardware." };

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="wrap py-12">
      <h1 className="display text-5xl">Where the materials went</h1>
      <p className="mt-3 max-w-2xl text-stone">Completed and current work. Useful when a client asks who else has built with CBH.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`} className="overflow-hidden rounded-[1.5rem] border border-line bg-card">
            <div className="aspect-[16/10]"><Cover src={parseJson<string[]>(project.photos, [])[0]} alt={project.name} /></div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-stone">{project.status === "in_progress" ? "In progress" : "Completed"} · {project.location}</p>
              <h2 className="display mt-2 text-3xl">{project.name}</h2>
              <p className="mt-2 text-sm text-stone">{project.products}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
