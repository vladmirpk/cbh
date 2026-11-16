import Link from "next/link";
import { logout } from "@/lib/actions/auth";
import { navFor } from "@/lib/roles";
import { labelOf, ROLES } from "@/lib/types";
import { Logo } from "@/components/site/Logo";

export function AdminShell({
  user,
  unread,
  children,
}: {
  user: { name: string; role: string };
  unread: number;
  children: React.ReactNode;
}) {
  const links = navFor(user.role);
  return (
    <div className="min-h-screen bg-plaster md:grid md:grid-cols-[240px_1fr]">
      <aside className="bg-[#071a4a] text-white md:min-h-screen">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Logo light />
          <p className="mt-2 hidden text-xs font-bold uppercase tracking-[0.16em] text-[#f5c400] md:block">Staff desk</p>
          <details className="md:hidden">
            <summary className="cursor-pointer text-sm">Menu</summary>
            <nav className="mt-3 grid gap-2 text-sm">
              {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
            </nav>
          </details>
        </div>
        <nav className="hidden px-3 pb-8 md:grid">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 md:px-8">
          <p className="text-sm font-semibold text-ink">{user.name} · {labelOf(ROLES, user.role)}</p>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin/notifications">Alerts{unread ? ` (${unread})` : ""}</Link>
            <Link href="/">View site</Link>
            <form action={logout}><button className="underline">Sign out</button></form>
          </div>
        </header>
        <div className="px-4 py-6 md:px-8">{children}</div>
      </div>
    </div>
  );
}
