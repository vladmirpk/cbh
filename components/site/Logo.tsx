import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 52 48" className="h-11 w-12 shrink-0" aria-hidden>
        <path d="M26 2 L50 18 H2 Z" fill="#f5c400" />
        <path d="M22 8 h8 v6 h-8 z" fill="#fff6cc" />
        <rect x="6" y="20" width="10" height="7" rx="0.5" fill="#1d4ed8" />
        <rect x="18" y="20" width="10" height="7" fill="#f5c400" />
        <rect x="30" y="20" width="14" height="7" fill="#1d4ed8" />
        <rect x="6" y="29" width="14" height="7" fill="#f5c400" />
        <rect x="22" y="29" width="10" height="7" fill="#1e40af" />
        <rect x="34" y="29" width="10" height="7" fill="#f5c400" />
        <rect x="6" y="38" width="10" height="7" fill="#1d4ed8" />
        <rect x="18" y="38" width="14" height="7" fill="#f5c400" />
        <rect x="34" y="38" width="10" height="7" fill="#1e3a8a" />
      </svg>
      <span className={light ? "text-white" : "text-[#0c3c8c]"}>
        <span className="block text-[15px] font-extrabold leading-none tracking-tight sm:text-[17px]">CONSOLIDATED</span>
        <span className="mt-0.5 block text-[10px] font-bold tracking-[0.12em] sm:text-[11px]">BRICKS AND HARDWARE</span>
      </span>
    </Link>
  );
}
