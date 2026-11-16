import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Branches", description: "CBH Harare branch on Gweru Road." };

export default async function BranchesPage() {
  const site = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  return (
    <div className="bg-[#f6f8fc]">
      <div className="wrap py-12">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0c3c8c]">Branches</p>
        <h1 className="mt-2 text-4xl font-extrabold text-[#0c3c8c]">Visit the yard</h1>
        <article className="mt-8 max-w-xl rounded-2xl border border-[#e6eef8] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-[#0c3c8c]">Harare</h2>
          <p className="mt-2">{site?.address}</p>
          <p className="mt-1">{site?.phone}</p>
          <p className="mt-1">{site?.email}</p>
          <p className="mt-3 text-sm text-[#3d5a80]">{site?.hours}</p>
        </article>
      </div>
    </div>
  );
}
