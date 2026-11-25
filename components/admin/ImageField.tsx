"use client";

import { useState } from "react";
import { uploadProductImage } from "@/lib/actions/admin";

type Variant = "gallery" | "poster";

export function ImageField({
  initial,
  variant = "gallery",
  name = variant === "poster" ? "image" : "imagesText",
  label = variant === "poster" ? "Poster" : "Photos",
  onChange,
}: {
  initial: string;
  variant?: Variant;
  name?: string;
  label?: string;
  onChange?: (urls: string[]) => void;
}) {
  const start = initial.split("\n").map((line) => line.trim()).filter(Boolean);
  const [urls, setUrls] = useState(variant === "poster" ? start.slice(0, 1) : start);

  function update(next: string[] | ((list: string[]) => string[])) {
    setUrls((list) => {
      const value = typeof next === "function" ? next(list) : next;
      onChange?.(value);
      return value;
    });
  }
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const single = variant === "poster";

  async function addFile(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const result = await uploadProductImage(body);
      if (result.error || !result.url) {
        setError(result.error || "The image could not be saved.");
        return;
      }
      update((list) => (single ? [result.url!] : [...list, result.url!]));
    } catch {
      setError("Upload failed. Use an image under 4 MB (JPG, PNG, or WebP).");
    } finally {
      setBusy(false);
    }
  }

  function addLink() {
    const value = link.trim();
    if (!value.startsWith("http") && !value.startsWith("/")) {
      setError("Paste a full image link, or upload a file.");
      return;
    }
    setError("");
    update((list) => (single ? [value] : [...list, value]));
    setLink("");
  }

  const hiddenValue = single ? urls[0] || "" : urls.join("\n");

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={hiddenValue} />
      <div className={single ? "grid gap-3" : "grid grid-cols-2 gap-3 sm:grid-cols-4"}>
        {urls.map((url, index) => (
          <div key={`${url}-${index}`} className="overflow-hidden rounded-2xl border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className={single ? "aspect-[16/9] w-full object-cover" : "aspect-[4/3] w-full object-cover"}
            />
            <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold">
              <span className="text-stone">{single ? label : index === 0 ? "Main photo" : `Photo ${index + 1}`}</span>
              <span className="flex gap-2">
                {!single && index > 0 ? (
                  <button type="button" className="text-ink" onClick={() => update([url, ...urls.filter((_, item) => item !== index)])}>
                    Use first
                  </button>
                ) : null}
                <button type="button" className="text-[#b42318]" onClick={() => update(urls.filter((_, item) => item !== index))}>
                  Remove
                </button>
              </span>
            </div>
          </div>
        ))}
        {single && !urls.length ? (
          <div className="grid aspect-[16/9] place-items-center rounded-2xl border border-dashed border-line bg-plaster text-sm text-stone">
            Poster preview appears here
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn btn-ink cursor-pointer">
          {busy ? "Uploading…" : single ? (urls.length ? "Replace poster" : "Upload poster") : "Upload photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void addFile(file);
              event.target.value = "";
            }}
          />
        </label>
        <input
          className="field max-w-sm"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder={single ? "Or paste a poster link" : "Or paste an image link"}
        />
        <button type="button" className="btn btn-ghost" onClick={addLink}>
          {single ? "Use link" : "Add link"}
        </button>
      </div>
      <p className="text-xs text-stone">
        {single
          ? "Upload a campaign poster (wide 16:9 works best). Stored with the site so it survives redeploys. JPG, PNG, or WebP, up to 4 MB."
          : "Add a main photo plus optional extra angles. Photos are stored with the catalogue so they survive redeploys. JPG, PNG, or WebP, up to 4 MB."}
      </p>
      {error ? <p className="text-sm font-medium text-[#b42318]">{error}</p> : null}
    </div>
  );
}
