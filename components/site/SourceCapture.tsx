"use client";

import { useEffect } from "react";

export function SourceCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("src") || params.get("utm_source");
    if (source) localStorage.setItem("cbh_source", source.toLowerCase().slice(0, 40));
  }, []);
  return null;
}
