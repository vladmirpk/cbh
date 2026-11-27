import Link from "next/link";
import { CBH_LOGO } from "@/lib/cbh-images";

export function Logo({
  light = false,
  href = "/",
  className = "",
}: {
  light?: boolean;
  href?: string | null;
  className?: string;
}) {
  const mark = (
    <span
      className={`inline-flex items-center ${
        light ? "rounded-xl bg-white px-2.5 py-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.18)]" : ""
      } ${className}`}
    >
      {/* Official CBH roof lockup — white plate on dark chrome. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CBH_LOGO}
        alt="Consolidated Bricks & Hardware"
        className="h-9 w-auto max-w-[240px] object-contain object-left sm:h-10 lg:h-11"
      />
    </span>
  );

  if (href === null) return mark;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Consolidated Bricks & Hardware home">
      {mark}
    </Link>
  );
}
