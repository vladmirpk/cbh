"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70",
    title: ["Build Better", "Together"],
    copy: "Quality bricks, building materials and hardware for your home, business and infrastructure.",
    href: "/products",
    cta: "Explore Our Products",
  },
  {
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=70",
    title: ["Strong Foundations", "Last Longer"],
    copy: "Common bricks, face bricks and the materials around them, quoted with delivery.",
    href: "/categories/bricks",
    cta: "Shop Bricks",
  },
  {
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=70",
    title: ["Delivered Across", "Zimbabwe"],
    copy: "Price the load and the suburb together. A salesperson confirms the formal quotation.",
    href: "/quote",
    cta: "Get a Quote",
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
      <img src={slide.image} alt="" decoding="async" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#082a78_0%,#0a3f9ee6_34%,#0a3f9e66_58%,transparent_78%)]" />
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
