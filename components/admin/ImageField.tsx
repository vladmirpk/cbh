"use client";

import { useState } from "react";
import { uploadProductImage } from "@/lib/actions/admin";

export function ImageField({ initial }: { initial: string }) {
  const [urls, setUrls] = useState(initial.split("\n").map((line) => line.trim()).filter(Boolean));
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addFile(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const result = await uploadProductImage(body);
      if (result.error || !result.url) {
        setError(result.error || "The photo could not be saved.");
        return;
      }
      setUrls((list) => [...list, result.url!]);
    } catch {
      setError("Upload failed. Use a photo under 4 MB (JPG, PNG, or WebP).");
    } finally {
      setBusy(false);
    }
  }

  function addLink() {
    const value = link.trim();
    if (!value.startsWith("http") && !value.startsWith("/")) {
      setError("Paste a full image link, or upload a photo.");
      return;
    }
    setError("");
    setUrls((list) => [...list, value]);
    setLink("");
  }

  return (
    <div className="grid gap-3">
      <input type="hidden" name="imagesText" value={urls.join("\n")} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {urls.map((url, index) => (
          <div key={`${url}-${index}`} className="overflow-hidden rounded-2xl border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold">
              <span className="text-stone">{index === 0 ? "Main photo" : `Photo ${index + 1}`}</span>
              <span className="flex gap-2">
                {index > 0 ? (
                  <button type="button" className="text-ink" onClick={() => setUrls([url, ...urls.filter((_, item) => item !== index)])}>
                    Use first
                  </button>
                ) : null}
                <button type="button" className="text-[#b42318]" onClick={() => setUrls(urls.filter((_, item) => item !== index))}>
                  Remove
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn btn-ink cursor-pointer">
          {busy ? "Uploading…" : "Upload photo"}
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
        <input className="field max-w-sm" value={link} onChange={(event) => setLink(event.target.value)} placeholder="Or paste an image link" />
        <button type="button" className="btn btn-ghost" onClick={addLink}>Add link</button>
      </div>
      <p className="text-xs text-stone">
        Add a main photo plus optional extra angles. Photos are stored with the catalogue so they survive redeploys.
        JPG, PNG, or WebP, up to 4 MB.
      </p>
      {error ? <p className="text-sm font-medium text-[#b42318]">{error}</p> : null}
    </div>
  );
}
