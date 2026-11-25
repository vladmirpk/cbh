"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Package, FileText, ShoppingCart, MessageCircle } from "lucide-react";

export function MobileDock({ whatsappHref }: { whatsappHref: string }) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const onQuote = pathname.startsWith("/quote");

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

  const side = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: Package },
  ] as const;

  const right = [
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: count },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(12,60,140,0.08)] backdrop-blur md:hidden"
      aria-label="Primary"
    >
      <div className="relative mx-auto grid max-w-lg grid-cols-5 items-end px-1 pb-1.5 pt-2">
        {side.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-bold ${active ? "text-ink" : "text-stone"}`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}

        {/* Raised primary CTA — clearer than a flat dock tab */}
        <div className="relative flex justify-center">
          <Link
            href="/quote"
            className={`-mt-7 flex h-[3.65rem] w-[3.65rem] flex-col items-center justify-center rounded-full border-4 border-white shadow-[0_10px_24px_rgba(12,60,140,0.22)] transition ${
              onQuote ? "bg-ink text-gold" : "bg-gold text-[#10233f]"
            }`}
            aria-label="Get a quote"
            aria-current={onQuote ? "page" : undefined}
          >
            <FileText size={20} strokeWidth={2.4} />
            <span className="text-[9px] font-extrabold leading-none tracking-wide">Quote</span>
          </Link>
        </div>

        {right.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-bold ${active ? "text-ink" : "text-stone"}`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {item.label}
              {item.badge ? (
                <span className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#e11d48] px-1 text-[10px] text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-bold text-[#157347]"
        >
          <MessageCircle size={20} />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
