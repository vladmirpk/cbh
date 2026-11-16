import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/promotions", label: "Promotions" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/projects", label: "Projects" },
  { href: "/delivery", label: "Delivery" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ whatsappHref }: { whatsappHref: string }) {
  return (
    <footer className="bg-[#071a4a] text-white">
      <div className="wrap flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between">
        <Logo light />
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#f5c400]">{link.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a href="https://facebook.com" aria-label="Facebook" className="hover:text-[#f5c400]">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1Z" /></svg>
          </a>
          <a href={whatsappHref} aria-label="WhatsApp" className="hover:text-[#f5c400]">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden><path d="M20 11.5A8.5 8.5 0 0 1 7.4 18.7L4 20l1.4-3.3A8.5 8.5 0 1 1 20 11.5Zm-8.5 7a7 7 0 0 0 3.6-1l.3-.2 2 .6-.6-1.9.2-.3a7 7 0 1 0-5.5 2.8Zm3.9-5.2c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.5.1-.5.7-.7.8-.2.2-.4.1a5.7 5.7 0 0 1-1.7-1 6.3 6.3 0 0 1-1.2-1.5c-.1-.2 0-.3.1-.4l.3-.4.1-.2a.4.4 0 0 0 0-.4c0-.1-.5-1.1-.6-1.5s-.4-.4-.5-.4h-.4a.8.8 0 0 0-.6.3 2.4 2.4 0 0 0-.8 1.8 4.2 4.2 0 0 0 .9 2.2 9.6 9.6 0 0 0 3.6 3.2 4 4 0 0 0 2.5.5 2.1 2.1 0 0 0 1.4-.9 1.7 1.7 0 0 0 .1-1c-.1-.1-.2-.1-.4-.2Z" /></svg>
          </a>
          <a href="https://youtube.com" aria-label="YouTube" className="hover:text-[#f5c400]">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden><path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6ZM9.8 15.5v-6.6l6.2 3.3-6.2 3.3Z" /></svg>
          </a>
          <p className="text-sm font-semibold text-[#f5c400]">Building a Better Zimbabwe</p>
        </div>
      </div>
    </footer>
  );
}
