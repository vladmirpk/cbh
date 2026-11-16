"use client";

import { useState } from "react";

function sized(src: string) {
  if (!src.includes("images.unsplash.com")) return { src };
  const base = src.split("?")[0];
  const crop = (width: number) => `${base}?auto=format&fit=crop&w=${width}&q=70`;
  return { src: crop(960), srcSet: `${crop(480)} 480w, ${crop(960)} 960w` };
}

export function Cover({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [ok, setOk] = useState(Boolean(src));
  if (!src || !ok) {
    return (
      <div className={`h-full w-full bg-[radial-gradient(circle_at_30%_20%,#f5c400,transparent_42%),linear-gradient(160deg,#0c3c8c,#071a4a)] ${className}`} />
    );
  }
  const photo = sized(src);
  return (
    // Catalogue photos can be remote or uploaded, and must fall back if a host blocks them.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes="(max-width: 768px) 100vw, 480px"
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={`h-full w-full object-cover ${className}`}
      onError={() => setOk(false)}
    />
  );
}
