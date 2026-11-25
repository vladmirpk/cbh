"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { logoutPublic } from "@/lib/actions/auth";
import { Logo } from "./Logo";
import { Cover } from "./Cover";
import { CartFlyout } from "./CartFlyout";

type Category = { href: string; label: string; image?: string | null };
type NavItem = { href: string; label: string };
type NavGroup = { label: string; href: string; items: NavItem[] };

export function Header({
  phone,
  categories,
  user,
}: {
  phone: string;
  email?: string;
  address?: string;
  categories: Category[];
  user: { name: string; role: string } | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const searchId = useId();
  const panelId = useId();
  const navRef = useRef<HTMLElement>(null);
  const accountHref = user ? (user.role === "customer" ? "/account" : "/admin") : "/login";
  const firstName = user?.name?.split(" ")[0] || "";

  const menus: NavGroup[] = [
    {
      label: "Products",
      href: "/products",
      items: [
        { href: "/categories", label: "All categories" },
        ...categories.map((category) => ({ href: category.href, label: category.label })),
        { href: "/upcoming", label: "Coming soon" },
        { href: "/solar-configurator", label: "Solar configurator" },
      ],
    },
    {
      label: "Services",
      href: "/services",
      items: [
        { href: "/quote", label: "Request a quote" },
        { href: "/delivery", label: "Delivery rates" },
        { href: "/services", label: "All services" },
        { href: "/promotions", label: "Promotions" },
      ],
    },
    {
      label: "Company",
      href: "/about",
      items: [
        { href: "/about", label: "About CBH" },
        { href: "/projects", label: "Projects" },
        { href: "/blog", label: "News" },
        { href: "/branches", label: "Branches" },
        { href: "/contact", label: "Contact" },
      ],
    },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) setNavOpen(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setNavOpen(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function search(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    setMenuOpen(false);
    window.location.href = q ? `/products?q=${encodeURIComponent(q)}` : "/products";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="wrap flex h-14 items-center gap-2 sm:h-16 sm:gap-3">
        <div className="min-w-0 shrink">
          <Logo />
        </div>

        <nav ref={navRef} className="ml-2 hidden min-w-0 flex-1 items-center gap-0.5 lg:flex" aria-label="Primary">
          {menus.map((menu) => {
            const expanded = navOpen === menu.label;
            return (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => setNavOpen(menu.label)}
                onMouseLeave={() => setNavOpen(null)}
              >
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-ink transition hover:bg-plaster ${expanded ? "bg-plaster" : ""}`}
                  aria-expanded={expanded}
                  aria-haspopup="true"
                  onClick={() => setNavOpen(expanded ? null : menu.label)}
                >
                  {menu.label}
                  <ChevronDown size={14} className={`transition ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded ? (
                  <div className="absolute left-0 top-full z-30 w-56 pt-1">
                    <div className="rounded-2xl border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(12,60,140,0.12)]">
                      <Link
                        href={menu.href}
                        className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-plaster"
                        onClick={() => setNavOpen(null)}
                      >
                        View all
                      </Link>
                      <div className="max-h-72 overflow-y-auto">
                        {menu.items.map((item) => (
                          <Link
                            key={item.href + item.label}
                            href={item.href}
                            className="block rounded-xl px-3 py-2 text-sm text-stone hover:bg-plaster hover:text-ink"
                            onClick={() => setNavOpen(null)}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
          <Link href="/contact" className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-plaster">
            Contact
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Desktop only — .btn sets display:inline-flex which would beat Tailwind `hidden` without ! */}
          <Link href="/quote" className="btn btn-primary !hidden h-10 px-4 text-sm lg:!inline-flex">
            Get a quote
          </Link>

          {/* Mobile: icon only. Desktop: icon + label. */}
          <Link
            href={accountHref}
            className={`inline-flex h-10 items-center justify-center rounded-xl border text-ink transition hover:bg-plaster ${
              user ? "border-[#cfe0f5] bg-[#f3f7fc]" : "border-line"
            } w-10 lg:w-auto lg:gap-2 lg:px-3`}
            aria-label={user ? `My account, signed in as ${user.name}` : "Sign in"}
          >
            <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-white">
              <UserRound size={15} />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                  user ? "bg-[#16a34a]" : "bg-[#94a3b8]"
                }`}
                aria-hidden
              />
            </span>
            <span className="hidden min-w-0 text-left leading-tight lg:block">
              <span className="block truncate text-[11px] font-bold uppercase tracking-[0.08em] text-stone">
                {user ? "Signed in" : "Account"}
              </span>
              <span className="block truncate text-sm font-extrabold text-ink">
                {user ? firstName : "Sign in"}
              </span>
            </span>
          </Link>

          <CartFlyout />

          <button
            type="button"
            className={`grid h-10 w-10 place-items-center rounded-xl border transition ${
              menuOpen
                ? "border-[#b42318] bg-[#b42318] text-white hover:bg-[#912018]"
                : "border-line bg-ink text-white hover:bg-[#0a3278]"
            }`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={panelId}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 top-14 z-40 bg-[#071a4a]/40 backdrop-blur-[2px] sm:top-16"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-x-0 top-full z-50 max-h-[min(88vh,920px)] overflow-y-auto border-b border-line bg-white shadow-[0_24px_60px_rgba(7,26,74,0.18)]"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 sm:px-0">
              <div className="wrap flex w-full items-center justify-between gap-3">
                <p className="text-sm font-extrabold text-ink">Menu</p>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-plaster px-4 text-sm font-bold text-ink hover:bg-[#fde8e8] hover:text-[#b42318]"
                >
                  <X size={16} />
                  Close
                </button>
              </div>
            </div>

            <div className="wrap py-5 sm:py-6">
              <form onSubmit={search} className="flex" role="search">
                <label htmlFor={searchId} className="sr-only">Search products</label>
                <input
                  id={searchId}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search bricks, pavers, solar…"
                  className="h-11 flex-1 rounded-l-xl border border-r-0 border-line bg-plaster px-4 text-sm outline-none focus:border-ink focus:bg-white"
                />
                <button type="submit" className="grid h-11 w-12 place-items-center rounded-r-xl bg-ink text-white" aria-label="Search">
                  <Search size={18} />
                </button>
              </form>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr_0.9fr]">
                <section>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Products</h2>
                    <Link href="/products" onClick={closeMenu} className="text-sm font-bold text-ink hover:underline">
                      Browse all
                    </Link>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categories.map((category) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        onClick={closeMenu}
                        className="group overflow-hidden rounded-2xl border border-line bg-plaster transition hover:border-ink/25 hover:bg-white"
                      >
                        <div className="aspect-[16/10] bg-[#e8eef8]">
                          <Cover src={category.image} alt="" className="transition duration-500 group-hover:scale-105" />
                        </div>
                        <div className="flex items-center justify-between gap-1 px-2.5 py-2">
                          <span className="truncate text-sm font-extrabold text-ink">{category.label}</span>
                          <ChevronRight size={14} className="shrink-0 text-stone" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                  {menus.slice(1).map((menu) => (
                    <div key={menu.label}>
                      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone">{menu.label}</h2>
                      <ul className="mt-2 space-y-0.5">
                        {menu.items.map((item) => (
                          <li key={item.href + item.label}>
                            <Link
                              href={item.href}
                              onClick={closeMenu}
                              className="flex items-center justify-between rounded-xl px-2 py-2.5 text-sm font-semibold text-ink hover:bg-plaster"
                            >
                              {item.label}
                              <ChevronRight size={14} className="text-stone" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>

                <section className="rounded-2xl border border-line bg-plaster p-4">
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone">My account</h2>
                  {user ? (
                    <div className="mt-3">
                      <div className="flex items-center gap-3">
                        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-ink text-white">
                          <UserRound size={20} />
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-plaster bg-[#16a34a]" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-extrabold text-ink">{user.name}</p>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#157347]">Signed in</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-1">
                        <Link href={accountHref} onClick={closeMenu} className="rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-ink">
                          {user.role === "customer" ? "Open my account" : "Open staff desk"}
                        </Link>
                        <form action={logoutPublic}>
                          <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#b42318] hover:bg-white">
                            <LogOut size={15} />
                            Sign out
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-2">
                      <p className="text-sm text-stone">Signed out</p>
                      <Link href="/login" onClick={closeMenu} className="btn btn-ink h-10 text-sm">Sign in</Link>
                      <Link href="/register" onClick={closeMenu} className="btn btn-ghost h-10 border border-line text-sm">Create account</Link>
                    </div>
                  )}
                </section>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <Phone size={15} />
                  {phone}
                </a>
                <button type="button" onClick={closeMenu} className="btn btn-ghost h-10 border border-line px-4 text-sm">
                  Close menu
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
