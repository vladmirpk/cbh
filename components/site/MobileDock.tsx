"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Package, FileText, ShoppingCart, MessageCircle } from "lucide-react";

export function MobileDock({ whatsappHref }: { whatsappHref: string }) {
  const pathname = usePathname();
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

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: Package },
    { href: "/quote", label: "Quote", icon: FileText },
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: count },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(12,60,140,0.08)] backdrop-blur md:hidden" aria-label="Primary">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-1 py-1.5">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[11px] font-bold ${active ? "bg-[#fff4cc] text-ink" : "text-stone"}`}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              {item.label}
              {"badge" in item && item.badge ? (
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
