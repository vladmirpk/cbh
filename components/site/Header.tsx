"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Mail, MapPin, Phone, Search, ShoppingCart, UserRound } from "lucide-react";
import { logoutPublic } from "@/lib/actions/auth";
import { Logo } from "./Logo";

type Item = { href: string; label: string };
type Group = { label: string; href: string; items: Item[] };

export function Header({
  phone,
  email,
  address,
  categories,
  user,
}: {
  phone: string;
  email: string;
  address: string;
  categories: Item[];
  user: { name: string; role: string } | null;
}) {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const searchId = useId();

  useEffect(() => {
    const read = () => {
      try {
        const raw = JSON.parse(localStorage.getItem("cbh_cart") || "[]");
        setCount(Array.isArray(raw) ? raw.length : 0);
      } catch {
        setCount(0);
      }
    };
    read();
    window.addEventListener("cbh-cart", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("cbh-cart", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const menus: Group[] = [
    {
      label: "Products",
      href: "/products",
      items: [{ href: "/categories", label: "All categories" }, ...categories],
    },
    {
      label: "Services",
      href: "/services",
      items: [
        { href: "/services", label: "All services" },
        { href: "/delivery", label: "Delivery rates" },
        { href: "/solar-configurator", label: "Solar configurator" },
        { href: "/quote", label: "Request a quote" },
      ],
    },
    {
      label: "Company",
      href: "/about",
      items: [
        { href: "/about", label: "About CBH" },
        { href: "/projects", label: "Projects" },
        { href: "/promotions", label: "Promotions" },
        { href: "/blog", label: "News" },
        { href: "/upcoming", label: "Upcoming" },
        { href: "/branches", label: "Branches" },
      ],
    },
  ];

  function search(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    window.location.href = q ? `/products?q=${encodeURIComponent(q)}` : "/products";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      {/* Desktop utility strip */}
      <div className="hidden border-b border-line text-[12px] text-stone lg:block">
        <div className="wrap flex h-9 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-ink">
              <Phone size={13} className="text-ink" />
              {phone}
            </a>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 hover:text-ink">
              <Mail size={13} className="text-ink" />
              {email}
            </a>
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
              <MapPin size={13} className="shrink-0 text-ink" />
              <span className="truncate">{address}</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3 font-semibold text-ink">
            {user ? (
              <>
                <Link href={user.role === "customer" ? "/account" : "/admin"} className="inline-flex items-center gap-1">
                  <UserRound size={14} />
                  {user.name.split(" ")[0]}
                </Link>
                <form action={logoutPublic}>
                  <button type="submit" className="font-semibold">Sign out</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-1">
                  <UserRound size={14} />
                  Sign in
                </Link>
                <Link href="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main bar — mobile: logo + cart only (bottom dock is primary nav) */}
      <div className="wrap flex h-14 items-center gap-3 lg:h-16 lg:gap-5">
        <div className="min-w-0 shrink">
          <Logo />
        </div>

        <nav ref={navRef} className="hidden min-w-0 flex-1 items-center gap-0.5 lg:flex" aria-label="Primary">
          {menus.map((menu) => {
            const expanded = openMenu === menu.label;
            return (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(menu.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-ink transition hover:bg-plaster ${expanded ? "bg-plaster" : ""}`}
                  aria-expanded={expanded}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(expanded ? null : menu.label)}
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
                        onClick={() => setOpenMenu(null)}
                      >
                        View all
                      </Link>
                      {menu.items.map((item) => (
                        <Link
                          key={item.href + item.label}
                          href={item.href}
                          className="block rounded-xl px-3 py-2 text-sm text-stone hover:bg-plaster hover:text-ink"
                          onClick={() => setOpenMenu(null)}
                        >
                          {item.label}
                        </Link>
                      ))}
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

        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          <form onSubmit={search} className="hidden items-center xl:flex" role="search">
            <label htmlFor={searchId} className="sr-only">Search products</label>
            <input
              id={searchId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="h-10 w-44 rounded-l-xl border border-r-0 border-line bg-plaster px-3 text-sm outline-none focus:border-ink focus:bg-white lg:w-52"
            />
            <button type="submit" className="grid h-10 w-10 place-items-center rounded-r-xl bg-ink text-white" aria-label="Search">
              <Search size={16} />
            </button>
          </form>

          <Link href="/quote" className="btn btn-primary hidden h-10 px-4 text-sm lg:inline-flex">
            Get a quote
          </Link>

          <Link
            href={user ? (user.role === "customer" ? "/account" : "/admin") : "/login"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:bg-plaster lg:hidden"
            aria-label={user ? "Account" : "Sign in"}
          >
            <UserRound size={18} />
          </Link>

          <Link
            href="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:bg-plaster"
            aria-label={count ? `Cart, ${count} items` : "Cart"}
          >
            <ShoppingCart size={18} />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#e11d48] px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
