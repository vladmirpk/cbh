import Link from "next/link";

const iconFor: Record<string, string> = {
  bricks: "bricks",
  pavers: "pavers",
  kerbstones: "kerb",
  "paver-slabs": "slab",
  "pool-copings": "pool",
  "building-materials": "cement",
  "solar-energy": "solar",
  lighting: "light",
  landscaping: "garden",
};

export function Departments({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const items = [
    ...categories.map((category) => ({
      label: category.name,
      href: `/categories/${category.slug}`,
      icon: iconFor[category.slug] || "bricks",
    })),
    { label: "Upcoming", href: "/upcoming", icon: "upcoming" },
  ].slice(0, 10);

  return (
    <div className="wrap relative z-10 -mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-10">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-2 rounded-2xl border border-[#e7eef8] bg-white px-2 py-4 text-center shadow-[0_10px_30px_rgba(12,60,140,0.08)] transition hover:-translate-y-0.5"
        >
          <DeptIcon name={item.icon} />
          <span className="text-sm font-semibold text-[#16325c]">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

function DeptIcon({ name }: { name: string }) {
  const common = "h-12 w-12";
  if (name === "bricks") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <rect x="6" y="10" width="16" height="8" rx="1" fill="#d3542a" />
        <rect x="24" y="10" width="18" height="8" rx="1" fill="#e67e22" />
        <rect x="6" y="20" width="22" height="8" rx="1" fill="#e67e22" />
        <rect x="30" y="20" width="12" height="8" rx="1" fill="#d3542a" />
        <rect x="6" y="30" width="14" height="8" rx="1" fill="#c0392b" />
        <rect x="22" y="30" width="20" height="8" rx="1" fill="#e67e22" />
      </svg>
    );
  }
  if (name === "pavers") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <rect x="8" y="10" width="14" height="10" rx="1" fill="#7f8c9b" />
        <rect x="26" y="10" width="14" height="10" rx="1" fill="#95a5b5" />
        <rect x="8" y="24" width="14" height="10" rx="1" fill="#95a5b5" />
        <rect x="26" y="24" width="14" height="10" rx="1" fill="#7f8c9b" />
      </svg>
    );
  }
  if (name === "kerb") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <path d="M8 34h32v4H8z" fill="#95a5b5" />
        <path d="M10 18h28l2 16H8z" fill="#b0bec5" />
      </svg>
    );
  }
  if (name === "slab") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <rect x="8" y="12" width="32" height="24" rx="2" fill="#cfd8dc" />
        <path d="M8 24h32" stroke="#90a4ae" strokeWidth="2" />
        <path d="M24 12v24" stroke="#90a4ae" strokeWidth="2" />
      </svg>
    );
  }
  if (name === "pool") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <path d="M8 28c4 4 8 4 12 0s8-4 12 0 8 4 12 0" stroke="#3498db" strokeWidth="3" fill="none" />
        <path d="M8 34c4 4 8 4 12 0s8-4 12 0 8 4 12 0" stroke="#5dade2" strokeWidth="3" fill="none" />
      </svg>
    );
  }
  if (name === "cement") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <path d="M14 16 h20 l4 20 H10 Z" fill="#d9dde3" />
        <path d="M16 16 h16 l-2-6 H18 Z" fill="#bfc5ce" />
        <rect x="18" y="24" width="12" height="7" rx="1" fill="#0c3c8c" />
      </svg>
    );
  }
  if (name === "solar") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <rect x="8" y="12" width="32" height="24" rx="2" fill="#0c3c8c" />
        <path d="M8 24h32M24 12v24M16 12v24M32 12v24" stroke="#f5c400" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name === "light") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <circle cx="24" cy="18" r="8" fill="#f5c400" />
        <path d="M20 26h8l-1 8h-6z" fill="#d4a800" />
        <path d="M24 8v-3M34 18h3M11 18h3M31 11l2-2M15 11l-2-2" stroke="#f5c400" strokeWidth="2" />
      </svg>
    );
  }
  if (name === "garden") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden>
        <path d="M24 36V18" stroke="#2e7d32" strokeWidth="3" />
        <path d="M24 22c-8-2-10-10-8-14 6 2 10 8 8 14Z" fill="#43a047" />
        <path d="M24 26c8-2 10-10 8-14-6 2-10 8-8 14Z" fill="#66bb6a" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className={common} aria-hidden>
      <circle cx="24" cy="24" r="14" fill="#fff4cc" stroke="#f5c400" strokeWidth="2" />
      <path d="M24 16v8l5 3" stroke="#0c3c8c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
