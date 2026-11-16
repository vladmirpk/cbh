"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ChevronDown, Mail, MapPin, Menu, Phone, Search, ShoppingCart, UserRound, X } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0);

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

  const menus: Group[] = [
    { label: "Products", href: "/products", items: categories },
    {
      label: "Services",
      href: "/services",
      items: [
        { href: "/services", label: "All services" },
        { href: "/delivery", label: "Bulk orders & deliveries" },
        { href: "/projects", label: "Construction support" },
        { href: "/contact", label: "Professional advice" },
        { href: "/quote", label: "Project supply solutions" },
      ],
    },
    {
      label: "About Us",
      href: "/about",
      items: [
        { href: "/about", label: "About CBH" },
        { href: "/projects", label: "Projects" },
        { href: "/blog", label: "News" },
        { href: "/upcoming", label: "Upcoming products" },
      ],
    },
    {
      label: "Branches",
      href: "/branches",
      items: [{ href: "/branches", label: "Harare — Gweru Road" }],
    },
    {
      label: "Orders",
      href: "/quote",
      items: [
        { href: "/quote", label: "Request a quote" },
        { href: "/cart", label: "Cart" },
        { href: "/account", label: "My orders" },
      ],
    },
  ];

  function search(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    window.location.href = q ? `/products?q=${encodeURIComponent(q)}` : "/products";
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_rgba(15,40,90,0.08)]">
      <div className="border-b border-[#e7eef8] text-[13px] text-[#334e75]">
        <div className="wrap flex items-center justify-between gap-3 py-2">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5"><Phone size={14} className="text-[#0c3c8c]" />{phone}</a>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5"><Mail size={14} className="text-[#0c3c8c]" />{email}</a>
            <span className="hidden items-center gap-1.5 md:inline-flex"><MapPin size={14} className="text-[#0c3c8c]" />{address}</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-[#0c3c8c]">
            {user ? (
              <>
                <Link href={user.role === "customer" ? "/account" : "/admin"} className="inline-flex items-center gap-1"><UserRound size={15} />{user.name.split(" ")[0]}</Link>
                <form action={logoutPublic}><button className="font-semibold">Sign out</button></form>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-1"><UserRound size={15} />Login</Link>
                <Link href="/register" className="inline-flex items-center gap-1">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="wrap flex items-center gap-4 py-3">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          <Link href="/" className="rounded-full bg-[#f5c400] px-4 py-2 text-sm font-bold text-[#10233f]">Home</Link>
          {menus.map((menu) => (
            <div key={menu.label} className="group relative">
              <Link href={menu.href} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-[#0c3c8c] hover:bg-[#f4f7fc]">
                {menu.label} <ChevronDown size={14} />
              </Link>
              <div className="invisible absolute left-0 top-full z-30 w-60 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div className="rounded-2xl border border-[#e4ecf7] bg-white p-2 shadow-xl">
                  {menu.items.map((item) => (
                    <Link key={item.href + item.label} href={item.href} className="block rounded-xl px-3 py-2 text-sm text-[#16325c] hover:bg-[#f4f7fc]">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <Link href="/contact" className="rounded-full px-3 py-2 text-sm font-semibold text-[#0c3c8c] hover:bg-[#f4f7fc]">Contact</Link>
        </nav>
        <form onSubmit={search} className="ml-auto hidden min-w-0 flex-1 items-center md:flex lg:max-w-xs">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-l-xl border border-r-0 border-[#d7e2f2] px-4 text-sm outline-none focus:border-[#0c3c8c]"
          />
          <button className="grid h-11 w-12 place-items-center rounded-r-xl bg-[#0c3c8c] text-white" aria-label="Search">
            <Search size={18} />
          </button>
        </form>
        <Link href="/cart" className="relative ml-auto grid h-11 w-11 place-items-center rounded-xl border border-[#d7e2f2] text-[#0c3c8c] md:ml-0" aria-label="Cart">
          <ShoppingCart size={20} />
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#e11d48] px-1 text-[10px] font-bold text-white">{count}</span>
        </Link>
        <button className="grid h-11 w-11 place-items-center rounded-xl border border-[#d7e2f2] text-[#0c3c8c] lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-[#e7eef8] bg-white px-4 py-4 lg:hidden">
          <form onSubmit={search} className="mb-3 flex md:hidden">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." className="h-11 flex-1 rounded-l-xl border border-[#d7e2f2] px-3 text-sm" />
            <button className="grid h-11 w-12 place-items-center rounded-r-xl bg-[#0c3c8c] text-white" aria-label="Search"><Search size={18} /></button>
          </form>
          <Link href="/" className="block py-2 font-semibold text-[#0c3c8c]" onClick={() => setOpen(false)}>Home</Link>
          {menus.map((menu) => (
            <div key={menu.label} className="border-t border-[#eef3fa] py-2">
              <Link href={menu.href} className="font-semibold text-[#0c3c8c]" onClick={() => setOpen(false)}>{menu.label}</Link>
              <div className="mt-1 grid">
                {menu.items.slice(0, 6).map((item) => (
                  <Link key={item.href + item.label} href={item.href} className="py-1 text-sm text-[#3d5a80]" onClick={() => setOpen(false)}>{item.label}</Link>
                ))}
              </div>
            </div>
          ))}
          <Link href="/contact" className="block border-t border-[#eef3fa] py-2 font-semibold text-[#0c3c8c]" onClick={() => setOpen(false)}>Contact</Link>
        </div>
      ) : null}
    </header>
  );
}
