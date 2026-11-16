"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nearestZone, roadKm } from "@/lib/delivery";

export type ZoneOption = {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  lat: number;
  lng: number;
};

export type LocationChoice = {
  zoneId: string;
  zoneName: string;
  distanceKm: number;
  method: "zone" | "pin";
  lat: string;
  lng: string;
};

export function ZonePicker({
  zones,
  depot,
  roadFactor,
  mapsKey,
  value,
  onChange,
}: {
  zones: ZoneOption[];
  depot: { name: string; lat: number; lng: number };
  roadFactor: number;
  mapsKey?: string;
  value: LocationChoice | null;
  onChange: (value: LocationChoice) => void;
}) {
  const areas = useMemo(() => {
    const map = new Map<string, ZoneOption[]>();
    for (const zone of zones) {
      map.set(zone.area, [...(map.get(zone.area) ?? []), zone]);
    }
    return [...map.entries()];
  }, [zones]);
  const mapRef = useRef<HTMLDivElement>(null);

  function chooseZone(zone: ZoneOption) {
    onChange({
      zoneId: zone.id,
      zoneName: zone.name,
      distanceKm: zone.distanceKm,
      method: "zone",
      lat: "",
      lng: "",
    });
  }

  function choosePin(lat: number, lng: number) {
    const near = zones.length ? nearestZone(zones, lat, lng) : null;
    onChange({
      zoneId: near?.id ?? "",
      zoneName: near ? `Near ${near.name}` : "Pinned location",
      distanceKm: roadKm(
        distance(depot.lat, depot.lng, lat, lng),
        roadFactor,
      ),
      method: "pin",
      lat: String(lat),
      lng: String(lng),
    });
  }

  function share() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      choosePin(position.coords.latitude, position.coords.longitude);
    });
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-[1.5rem] bg-olive p-4 text-plaster md:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#d7c4a4]">Dispatch map · {depot.name}</p>
            <p className="mt-1 text-sm text-[#e7efe9]">Pick a suburb, share your location, or drop a pin. Distance is measured from the CBH yard.</p>
          </div>
          <button type="button" className="btn btn-ghost border-white/30 text-sm" onClick={share}>
            Share my location
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {areas.map(([area, items]) => (
            <div key={area}>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#d7c4a4]">{area}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {items.map((zone) => {
                  const selected = value?.zoneId === zone.id && value.method === "zone";
                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => chooseZone(zone)}
                      className={`rounded-full px-3 py-1.5 text-sm ${selected ? "bg-brick text-white" : "bg-white/10 hover:bg-white/20"}`}
                    >
                      {zone.name}
                      <span className="ml-1 text-[11px] opacity-70">{zone.distanceKm} km</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {mapsKey ? <MapPin mapRef={mapRef} mapsKey={mapsKey} depot={depot} onPick={choosePin} /> : null}
      {value ? (
        <p className="text-sm text-stone">
          Using <strong className="text-ink">{value.zoneName}</strong> · about {value.distanceKm} km
          {value.method === "pin" ? " (road-adjusted from the pin)" : " (zone rate set by CBH)"}.
        </p>
      ) : null}
    </div>
  );
}

function distance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function MapPin({
  mapRef,
  mapsKey,
  depot,
  onPick,
}: {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapsKey: string;
  depot: { lat: number; lng: number };
  onPick: (lat: number, lng: number) => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { google?: { maps: { Map: new (el: HTMLElement, opts: object) => { addListener: (name: string, cb: (event: { latLng: { lat: () => number; lng: () => number } }) => void) => void } } } };
    if (w.google?.maps) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}`;
    script.async = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, [mapsKey]);

  useEffect(() => {
    const w = window as Window & { google?: { maps: { Map: new (el: HTMLElement, opts: object) => { addListener: (name: string, cb: (event: { latLng: { lat: () => number; lng: () => number } }) => void) => void } } } };
    if (!ready || !mapRef.current || !w.google?.maps) return;
    const map = new w.google.maps.Map(mapRef.current, {
      center: { lat: depot.lat, lng: depot.lng },
      zoom: 11,
      disableDefaultUI: true,
      zoomControl: true,
    });
    map.addListener("click", (event) => onPick(event.latLng.lat(), event.latLng.lng()));
  }, [ready, depot.lat, depot.lng, mapRef, onPick]);

  return (
    <div>
      <p className="label">Or drop a pin</p>
      <div ref={mapRef} className="h-64 overflow-hidden rounded-[1.4rem] border border-line bg-white" />
    </div>
  );
}
