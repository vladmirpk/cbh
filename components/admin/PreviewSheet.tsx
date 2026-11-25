"use client";

import { useState } from "react";
import Link from "next/link";

export function PreviewSheet({
  title,
  lines,
  editHref,
  previewHref,
  triggerLabel = "Preview",
}: {
  title: string;
  lines: { label: string; value: string }[];
  editHref?: string;
  previewHref?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-8 items-center rounded-full border border-line px-3 text-xs font-bold text-ink hover:bg-plaster"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a4a]/45 p-3 backdrop-blur-[2px] sm:items-center">
          <button type="button" className="absolute inset-0" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">Preview</p>
            <h2 className="display mt-1 text-2xl text-ink">{title}</h2>
            <dl className="mt-4 grid gap-2 text-sm">
              {lines.map((line) => (
                <div key={line.label} className="grid grid-cols-[110px_1fr] gap-2 border-b border-line py-1.5">
                  <dt className="text-stone">{line.label}</dt>
                  <dd className="font-semibold text-ink break-words">{line.value || "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Close</button>
              {previewHref ? (
                <Link href={previewHref} className="btn btn-ghost border border-line" target="_blank" rel="noreferrer">
                  Open live
                </Link>
              ) : null}
              {editHref ? (
                <Link href={editHref} className="btn btn-primary" onClick={() => setOpen(false)}>
                  Edit
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
