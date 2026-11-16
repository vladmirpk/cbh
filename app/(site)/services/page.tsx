import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Services", description: "Bulk supply, delivery, construction support and project quotations from CBH." };

const services = [
  ["Bulk orders & deliveries", "Price materials and an indicative delivery from the Harare yard to your suburb.", "/quote"],
  ["Construction support", "See the projects already supplied, from residential schemes to commercial yards.", "/projects"],
  ["Professional advice", "Talk to the yard about specification, quantity and the right product status.", "/contact"],
  ["Project supply solutions", "Register a contractor account and ask for a quotation against a live site.", "/contact"],
];

export default function ServicesPage() {
  return (
    <div className="bg-[#f6f8fc]">
      <div className="wrap py-12">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0c3c8c]">Services</p>
        <h1 className="mt-2 text-4xl font-extrabold text-[#0c3c8c]">From foundation to finish</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {services.map(([title, copy, href]) => (
            <Link key={title} href={href} className="rounded-2xl border border-[#e6eef8] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-extrabold text-[#0c3c8c]">{title}</h2>
              <p className="mt-2 text-[#3d5a80]">{copy}</p>
              <p className="mt-4 text-sm font-bold text-[#0c3c8c]">Learn more →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
