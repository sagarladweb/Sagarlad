"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { countryToISO } from "@/lib/country-iso";

type Country = { country: string; users: number; sessions: number };

const MAP_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function WorldMap({ data }: { data: Country[] }) {
  const [hovered, setHovered] = useState<Country | null>(null);

  const isoMap = useMemo(() => {
    const m = new Map<string, Country>();
    for (const c of data) {
      const iso = countryToISO(c.country);
      if (iso) m.set(iso, c);
    }
    return m;
  }, [data]);

  const maxUsers = Math.max(...data.map((c) => c.users), 1);

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl border border-border/40">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: [20, 20],
          }}
          style={{ width: "100%", height: "auto", maxHeight: 340 }}
        >
          <Geographies geography={MAP_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const iso = geo.id as string;
                const match = isoMap.get(iso);
                const intensity = match
                  ? 0.3 + (match.users / maxUsers) * 0.7
                  : 0;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      rsmKey={geo.rsmKey}
                      geography={geo}
                    onMouseEnter={() => match && setHovered(match)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      default: {
                        fill: match ? `var(--accent)` : "var(--muted)",
                        fillOpacity: match ? intensity : 0.3,
                        stroke: "var(--border)",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: match ? "pointer" : "default",
                      },
                      hover: {
                        fill: match ? `var(--accent)` : "var(--muted)",
                        fillOpacity: match ? Math.min(intensity + 0.2, 1) : 0.4,
                        stroke: "var(--border)",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: match ? "pointer" : "default",
                      },
                      pressed: {
                        fill: match ? `var(--accent)` : "var(--muted)",
                        fillOpacity: match ? intensity : 0.3,
                        stroke: "var(--border)",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-2 rounded-lg border border-border/60 bg-card/95 backdrop-blur-sm text-sm shadow-lg pointer-events-none">
          <p className="font-semibold">{hovered.country}</p>
          <p className="text-xs text-muted-foreground">
            {hovered.users} users · {hovered.sessions} sessions
          </p>
        </div>
      )}

      {/* Country legend */}
      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
          {data.map((c) => {
            const intensity = c.users / maxUsers;
            return (
              <div key={c.country} className="flex items-center gap-2.5">
                <span
                  className="shrink-0 rounded-full"
                  style={{
                    width: `${8 + intensity * 8}px`,
                    height: `${8 + intensity * 8}px`,
                    backgroundColor: "var(--accent)",
                    opacity: 0.4 + intensity * 0.6,
                  }}
                />
                <span className="truncate text-muted-foreground">{c.country}</span>
                <span className="ml-auto tabular-nums font-medium text-xs">{c.users}</span>
              </div>
            );
          })}
        </div>
      )}

      {data.length === 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          No location data yet. Configure GA_PROPERTY_ID to see visitor countries.
        </div>
      )}
    </div>
  );
}
