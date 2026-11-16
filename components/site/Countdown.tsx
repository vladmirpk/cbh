"use client";

import { useEffect, useState } from "react";

export function Countdown({ date }: { date: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <p className="text-sm text-stone">Counting down to launch…</p>;
  const diff = Math.max(0, new Date(date).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const parts = [
    [days, "days"],
    [hours, "hours"],
    [minutes, "min"],
  ];
  return (
    <div className="flex gap-3">
      {parts.map(([value, label]) => (
        <div key={label} className="min-w-16 rounded-2xl bg-ink px-3 py-2 text-center text-plaster">
          <p className="display text-2xl leading-none">{value}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#f5c400]">{label}</p>
        </div>
      ))}
    </div>
  );
}
