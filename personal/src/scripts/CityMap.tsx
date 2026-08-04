/* personal/src/scripts/CityMap.tsx
* Copyright (c) 2026 Clove Nytrix Doughmination Twilight
* Licensed under the DASL-1.0 Licence.
* See LICENCE.md in the project root for full licence information.
*/

"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import { useLanguage } from "@/i18n/LanguageProvider";

interface GeocodeResult {
  lat: number;
  lon: number;
}

async function geocodeCity(query: string): Promise<GeocodeResult | null> {
  const cacheKey = `dough:geocode:${query}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data?.length) return null;
    const result: GeocodeResult = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}

export default function CityMap({
  query,
  label,
  className
}: {
  query: string;
  label: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const [coords, setCoords] = useState<GeocodeResult | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setCoords(undefined);
    geocodeCity(query).then((res) => {
      if (!cancelled) setCoords(res);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  if (coords === undefined) return <div className={className} aria-hidden="true" />;
  if (coords === null) return null; // geocode failed — just fall back to the label/link

  return (
    <MapContainer
      className={className}
      center={[coords.lat, coords.lon]}
      zoom={11}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      attributionControl={true}
      aria-label={t("map.showing").replace("{name}", label)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle center={[coords.lat, coords.lon]} radius={3000} pathOptions={{ color: "#3388ff" }} />
    </MapContainer>
  );
}