import { prisma } from "@/lib/prisma";
import { waLink } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileDock } from "@/components/site/MobileDock";
import { SourceCapture } from "@/components/site/SourceCapture";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, site, session] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.siteSetting.findUnique({ where: { id: "default" } }),
    getSession(),
  ]);
  const phone = site?.phone || "+263 242 123 456";
  const email = site?.email || "sales@cbh.co.zw";
  const address = site?.address || "Stand 123, Gweru Road, Harare";
  const whatsappHref = waLink(site?.whatsapp || phone, "Hello CBH, I need materials.");
  return (
    <>
      <SourceCapture />
      <Header
        phone={phone}
        email={email}
        address={address}
        categories={categories.map((category) => ({ href: `/categories/${category.slug}`, label: category.name }))}
        user={session ? { name: session.name, role: session.role } : null}
      />
      <main id="content" className="bg-plaster pb-24 md:pb-0">{children}</main>
      <Footer whatsappHref={whatsappHref} />
      <MobileDock whatsappHref={whatsappHref} />
    </>
  );
}
