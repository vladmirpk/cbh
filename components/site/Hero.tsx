"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Cover } from "./Cover";
import { CBH_HERO } from "@/lib/cbh-images";

const slides = [
  {
    image: CBH_HERO.bricks,
    title: ["Walls that", "outlast the season"],
    copy: "Common, face and maxi bricks from the Workington yard — priced per unit, delivered to your stand.",
    href: "/categories/bricks",
    cta: "Browse bricks",
  },
  {
    image: CBH_HERO.pavers,
    title: ["The drive looks", "finished"],
    copy: "Interlocking pavers, kerbs and bullnose pool edges. Quote the load and the suburb in one go.",
    href: "/categories/pavers",
    cta: "Shop outdoor finishes",
  },
  {
    image: CBH_HERO.solar,
    title: ["Sun first.", "Grid second."],
    copy: "Home systems, inverters and batteries joining the CBH catalogue. Register interest before the containers land.",
    href: "/categories/solar-energy",
    cta: "Register for solar",
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((value) => (value + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, []);
  const slide = slides[index];
  return (
    <section className="relative overflow-hidden bg-[#08275f] text-white">
      <div className="absolute inset-0">
        <Cover src={slide.image} alt="" priority />
      </div>
      {/* Soft left wash — banners already carry navy overlays for type. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#071a4acc_0%,#08275f99_28%,#08275f33_52%,transparent_72%)]" />
      <div className="wrap relative flex min-h-[460px] items-center py-16 md:min-h-[520px]">
        <div className="max-w-xl">
          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
            {slide.title[0]}
            <span className="mt-1 block text-[#f5c400]">{slide.title[1]}</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/90">{slide.copy}</p>
          <Link href={slide.href} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f5c400] px-5 py-3 text-sm font-bold text-[#10233f]">
            {slide.cta} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      <button className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur" onClick={() => setIndex((value) => (value + slides.length - 1) % slides.length)} aria-label="Previous slide">
        <ChevronLeft />
      </button>
      <button className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur" onClick={() => setIndex((value) => (value + 1) % slides.length)} aria-label="Next slide">
        <ChevronRight />
      </button>
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((item, dot) => (
          <button key={item.title[0]} aria-label={`Slide ${dot + 1}`} onClick={() => setIndex(dot)} className={`h-2.5 rounded-full ${dot === index ? "w-6 bg-[#f5c400]" : "w-2.5 bg-white/70"}`} />
        ))}
      </div>
    </section>
  );
}
