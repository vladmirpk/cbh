"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Cover } from "./Cover";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const photos = images.length ? images : [null];
  const photoKey = images.join("|");
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const current = photos[index] ?? null;

  useEffect(() => {
    setIndex(0);
  }, [photoKey]);

  function go(delta: number) {
    setIndex((value) => (value + delta + photos.length) % photos.length);
  }

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-line bg-white">
      <div
        className="relative aspect-[4/3] touch-pan-y"
        onTouchStart={(event) => {
          touchStart.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current == null) return;
          const end = event.changedTouches[0]?.clientX ?? touchStart.current;
          const diff = end - touchStart.current;
          if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
          touchStart.current = null;
        }}
      >
        <Cover src={current} alt={alt} priority />
        {photos.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow"
              onClick={() => go(-1)}
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow"
              onClick={() => go(1)}
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photos.map((_, dot) => (
                <button
                  key={dot}
                  type="button"
                  aria-label={`Photo ${dot + 1}`}
                  onClick={() => setIndex(dot)}
                  className={`h-2.5 rounded-full ${dot === index ? "w-6 bg-gold" : "w-2.5 bg-white/80"}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
      {photos.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 p-3 sm:grid-cols-5">
          {photos.map((image, thumb) => (
            <button
              key={`${image}-${thumb}`}
              type="button"
              onClick={() => setIndex(thumb)}
              className={`overflow-hidden rounded-xl border-2 ${thumb === index ? "border-ink" : "border-transparent"}`}
              aria-label={`Show photo ${thumb + 1}`}
            >
              <div className="aspect-square">
                <Cover src={image} alt="" />
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
