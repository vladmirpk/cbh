"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  Bell,
  Building2,
  Contact,
  FileText,
  Gauge,
  Grid2x2,
  HelpCircle,
  Map,
  Megaphone,
  Menu,
  Package,
  PenLine,
  Search,
  Settings,
  Shield,
  Truck,
  Users,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { navGroupsFor, quickActionsFor } from "@/lib/roles";
import { labelOf, ROLES } from "@/lib/types";
import { Logo } from "@/components/site/Logo";

const ICONS: Record<string, ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  gauge: Gauge,
  bell: Bell,
  users: Users,
  contact: Contact,
  file: FileText,
  truck: Truck,
  package: Package,
  grid: Grid2x2,
  map: Map,
  megaphone: Megaphone,
  building: Building2,
  pen: PenLine,
  help: HelpCircle,
  shield: Shield,
  settings: Settings,
  activity: Activity,
};

export function AdminShell({
  user,
  unread,
  children,
}: {
  user: { name: string; role: string; email?: string };
  unread: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const groups = useMemo(() => navGroupsFor(user.role), [user.role]);
  const actions = useMemo(() => quickActionsFor(user.role).slice(0, 3), [user.role]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function runSearch(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    const params = q ? `?q=${encodeURIComponent(q)}` : "";
    if (canSearchLeads(user.role)) {
      window.location.href = `/admin/leads${params}`;
      return;
    }
    window.location.href = `/admin/products${params}`;
  }

  const nav = (
    <>
      <div className="border-b border-white/10 px-5 py-5">
        <Logo light />
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Command centre</p>
        <p className="mt-1 text-xs text-white/55">CBH staff desk</p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{group.label}</p>
            <ul className="mt-2 space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon] || Gauge;
                const active = isActive(item.href);
                const alert = item.href === "/admin/notifications" && unread > 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-gold text-[#10233f] shadow-[0_8px_20px_rgba(245,196,0,0.25)]"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon size={17} strokeWidth={active ? 2.4 : 2} />
                      <span className="flex-1">{item.label}</span>
                      {alert ? (
                        <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ${active ? "bg-[#10233f] text-gold" : "bg-[#e11d48] text-white"}`}>
                          {unread > 9 ? "9+" : unread}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/5 p-3">
          <p className="truncate text-sm font-extrabold text-white">{user.name}</p>
          <p className="mt-0.5 text-xs text-white/50">{labelOf(ROLES, user.role)}</p>
          <Link href="/" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:underline">
            View storefront <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-plaster lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="hidden min-h-screen flex-col bg-[#071a4a] text-white lg:flex">
        {nav}
      </aside>

      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-[#071a4a]/50 backdrop-blur-[2px] lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col bg-[#071a4a] text-white shadow-2xl lg:hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-extrabold text-white">Menu</p>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{nav}</div>
          </aside>
        </>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            <form onSubmit={runSearch} className="hidden min-w-0 flex-1 md:block md:max-w-md" role="search">
              <label className="sr-only" htmlFor="desk-search">Search the desk</label>
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
                <input
                  id="desk-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={canSearchLeads(user.role) ? "Jump to leads desk…" : "Jump to catalogue…"}
                  className="h-10 w-full rounded-xl border border-line bg-plaster pl-9 pr-3 text-sm outline-none focus:border-ink focus:bg-white"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-1.5 xl:flex">
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink hover:bg-plaster"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
              <Link
                href="/admin/notifications"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:bg-plaster"
                aria-label={unread ? `${unread} alerts` : "Alerts"}
              >
                <Bell size={17} />
                {unread ? (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#e11d48] px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/"
                className="hidden h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-bold text-ink hover:bg-plaster sm:inline-flex"
              >
                Site
                <ExternalLink size={14} />
              </Link>
              <form action={logout}>
                <button type="submit" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-sm font-bold text-ink hover:bg-plaster">
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function canSearchLeads(role: string) {
  return ["super_admin", "management", "salesperson"].includes(role);
}
