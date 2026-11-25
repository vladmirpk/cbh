"use client";

import Link from "next/link";
import { FormEvent, useEffect, useId, useState } from "react";
import {
  ChevronRight,
  LogOut,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { logoutPublic } from "@/lib/actions/auth";
import { Logo } from "./Logo";
import { Cover } from "./Cover";

type Category = { href: string; label: string; image?: string | null };

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(0);
  const searchId = useId();
  const panelId = useId();
  const accountHref = user ? (user.role === "customer" ? "/account" : "/admin") : "/login";
  const firstName = user?.name?.split(" ")[0] || "";

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

  function search(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    setOpen(false);
    window.location.href = q ? `/products?q=${encodeURIComponent(q)}` : "/products";
  }

  function close() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="wrap flex h-14 items-center gap-2 sm:h-16 sm:gap-3">
        <div className="min-w-0 shrink">
          <Logo />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link href="/quote" className="btn btn-primary hidden h-10 px-4 text-sm md:inline-flex">
            Get a quote
          </Link>

          {/* My account — always visible, shows signed-in state */}
          <Link
            href={accountHref}
            className={`inline-flex h-10 max-w-[10.5rem] items-center gap-2 rounded-xl border px-2.5 text-ink transition hover:bg-plaster sm:max-w-none sm:px-3 ${
              user ? "border-[#cfe0f5] bg-[#f3f7fc]" : "border-line"
            }`}
            aria-label={user ? `My account, signed in as ${user.name}` : "Sign in to my account"}
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
            <span className="min-w-0 text-left leading-tight">
              <span className="block truncate text-[11px] font-bold uppercase tracking-[0.08em] text-stone">
                {user ? "Signed in" : "Account"}
              </span>
              <span className="block truncate text-sm font-extrabold text-ink">
                {user ? firstName : "Sign in"}
              </span>
            </span>
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

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-ink text-white hover:bg-[#0a3278]"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#071a4a]/35 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={close}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="absolute inset-x-0 top-full z-50 max-h-[min(88vh,920px)] overflow-y-auto border-b border-line bg-white shadow-[0_24px_60px_rgba(7,26,74,0.18)]"
          >
            <div className="wrap py-5 sm:py-6">
              <form onSubmit={search} className="flex" role="search">
                <label htmlFor={searchId} className="sr-only">Search products</label>
                <input
                  id={searchId}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search bricks, pavers, solar…"
                  className="h-11 flex-1 rounded-l-xl border border-r-0 border-line bg-plaster px-4 text-sm outline-none focus:border-ink focus:bg-white"
                  autoFocus
                />
                <button type="submit" className="grid h-11 w-12 place-items-center rounded-r-xl bg-ink text-white" aria-label="Search">
                  <Search size={18} />
                </button>
              </form>

              {/* Mega menu */}
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr_0.9fr]">
                <section>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Products</h2>
                    <Link href="/products" onClick={close} className="text-sm font-bold text-ink hover:underline">
                      Browse all
                    </Link>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categories.map((category) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        onClick={close}
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
                    <Link
                      href="/categories"
                      onClick={close}
                      className="flex min-h-[4.5rem] flex-col justify-center rounded-2xl border border-dashed border-line px-3 py-3 text-sm font-bold text-ink hover:border-ink/30 hover:bg-plaster sm:col-span-1"
                    >
                      All categories
                    </Link>
                    <Link
                      href="/upcoming"
                      onClick={close}
                      className="flex min-h-[4.5rem] flex-col justify-center rounded-2xl border border-dashed border-line px-3 py-3 text-sm font-bold text-ink hover:border-ink/30 hover:bg-plaster"
                    >
                      Coming soon
                    </Link>
                    <Link
                      href="/solar-configurator"
                      onClick={close}
                      className="flex min-h-[4.5rem] flex-col justify-center rounded-2xl bg-ink px-3 py-3 text-sm font-bold text-white hover:bg-[#0a3278] sm:col-span-1"
                    >
                      Solar configurator
                    </Link>
                  </div>
                </section>

                <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Services</h2>
                    <ul className="mt-2 space-y-0.5">
                      {[
                        { href: "/quote", label: "Request a quote" },
                        { href: "/delivery", label: "Delivery rates" },
                        { href: "/services", label: "All services" },
                        { href: "/promotions", label: "Promotions" },
                      ].map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="flex items-center justify-between rounded-xl px-2 py-2.5 text-sm font-semibold text-ink hover:bg-plaster"
                          >
                            {item.label}
                            <ChevronRight size={14} className="text-stone" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Company</h2>
                    <ul className="mt-2 space-y-0.5">
                      {[
                        { href: "/about", label: "About CBH" },
                        { href: "/projects", label: "Projects" },
                        { href: "/blog", label: "News" },
                        { href: "/branches", label: "Branches" },
                        { href: "/contact", label: "Contact" },
                      ].map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="flex items-center justify-between rounded-xl px-2 py-2.5 text-sm font-semibold text-ink hover:bg-plaster"
                          >
                            {item.label}
                            <ChevronRight size={14} className="text-stone" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                        <Link
                          href={accountHref}
                          onClick={close}
                          className="rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-ink hover:bg-white"
                        >
                          {user.role === "customer" ? "Open my account" : "Open staff desk"}
                        </Link>
                        {user.role === "customer" ? (
                          <Link href="/quote" onClick={close} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-white">
                            New quotation
                          </Link>
                        ) : null}
                        <form action={logoutPublic}>
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#b42318] hover:bg-white"
                          >
                            <LogOut size={15} />
                            Sign out
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-center gap-3">
                        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#94a3b8] text-white">
                          <UserRound size={20} />
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-plaster bg-[#cbd5e1]" />
                        </span>
                        <div>
                          <p className="font-extrabold text-ink">Guest</p>
                          <p className="text-xs font-semibold uppercase tracking-wide text-stone">Signed out</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2">
                        <Link href="/login" onClick={close} className="btn btn-ink h-10 text-sm">
                          Sign in
                        </Link>
                        <Link href="/register" onClick={close} className="btn btn-ghost h-10 border border-line text-sm">
                          Create account
                        </Link>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <Phone size={15} />
                  {phone}
                </a>
                <div className="flex flex-wrap gap-2">
                  <Link href="/quote" onClick={close} className="btn btn-primary h-10 px-4 text-sm md:hidden">
                    Get a quote
                  </Link>
                  <Link href="/contact" onClick={close} className="btn btn-ghost h-10 border border-line px-4 text-sm">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
