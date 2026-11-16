import { PRODUCT_STATUSES, LEAD_STATUSES, labelOf } from "@/lib/types";

const productTone: Record<string, string> = {
  available: "bg-[#e7f6ee] text-[#157347]",
  coming_soon: "bg-[#fff4cc] text-[#8a6a00]",
  pre_order: "bg-ink text-white",
  out_of_stock: "bg-[#fde8e8] text-[#b42318]",
  unavailable: "bg-[#fde8e8] text-[#b42318]",
  discontinued: "bg-[#e8eef8] text-stone",
  promotional: "bg-gold text-[#10233f]",
};

const leadTone: Record<string, string> = {
  new: "bg-[#fff4cc] text-[#8a6a00]",
  contacted: "bg-[#e7f0ff] text-ink",
  quoted: "bg-ink text-white",
  negotiating: "bg-[#fff4cc] text-[#8a6a00]",
  won: "bg-[#e7f6ee] text-[#157347]",
  lost: "bg-[#e8eef8] text-stone",
};

export function StatusPill({ status, kind = "product" }: { status: string; kind?: "product" | "lead" }) {
  const label = kind === "lead" ? labelOf(LEAD_STATUSES, status) : labelOf(PRODUCT_STATUSES, status);
  const tone = (kind === "lead" ? leadTone : productTone)[status] ?? "bg-white text-ink";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone}`}>{label}</span>;
}

export function Denied() {
  return (
    <div className="panel p-8">
      <h1 className="display text-3xl">This desk is for another role</h1>
      <p className="mt-3 max-w-lg text-stone">Your account can keep working in the areas shown in the menu. Ask a super administrator if you need this one.</p>
    </div>
  );
}
