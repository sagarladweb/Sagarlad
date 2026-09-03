"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Map as MaplibreMap, NavigationControl, Popup, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { countryToISO } from "@/lib/country-iso";

type Country = { country: string; users: number; sessions: number };

const WORLD_GEOJSON =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson";

// ISO-2 → [lng, lat] centroids for visitor countries
const CENTROIDS: Record<string, [number, number]> = {
  US: [-95.7, 37.1], GB: [-3.4, 55.4], IN: [78.9, 20.6], DE: [10.4, 51.2],
  FR: [2.2, 46.2], CA: [-106.4, 56.1], AU: [133.8, -25.3], JP: [138.2, 36.2],
  BR: [-51.9, -14.2], NG: [8.7, 9.1], ZA: [22.9, -30.6], EG: [30.8, 26.8],
  KE: [37.9, 0.0], GH: [-1.2, 7.9], PK: [69.3, 30.4], BD: [90.4, 23.7],
  LK: [80.9, 7.9], NP: [84.1, 28.4], PH: [122.0, 12.9], ID: [113.9, -0.8],
  MY: [101.9, 4.2], SG: [103.8, 1.4], TH: [100.9, 15.9], VN: [108.3, 14.1],
  KR: [127.8, 35.9], TW: [120.9, 23.7], HK: [114.2, 22.4], MX: [-102.5, 23.6],
  AR: [-63.6, -38.4], CL: [-71.5, -35.7], CO: [-74.3, 4.6], PE: [-75.0, -9.2],
  ES: [-3.7, 40.5], IT: [12.6, 41.9], NL: [5.3, 52.1], BE: [4.4, 50.5],
  SE: [18.6, 60.1], NO: [8.5, 60.5], DK: [9.5, 56.3], FI: [25.7, 61.9],
  PL: [19.1, 51.9], CZ: [15.5, 49.8], AT: [14.6, 47.5], CH: [8.2, 46.8],
  PT: [-8.2, 39.4], GR: [21.8, 39.1], RO: [24.9, 45.9], UA: [31.2, 48.4],
  TR: [35.2, 38.9], SA: [45.1, 23.9], AE: [53.8, 23.4], QA: [51.2, 25.4],
  IL: [34.8, 31.0], JO: [36.2, 30.6], MA: [-7.1, 31.8], TN: [9.5, 33.9],
  ET: [40.5, 9.1], TZ: [34.9, -6.4], UG: [32.3, 1.4], SN: [-14.5, 14.5],
  CM: [12.4, 7.4], RU: [105.3, 61.5], CN: [104.2, 35.9], MN: [103.8, 46.9],
  KZ: [66.9, 48.0], UZ: [64.6, 41.3], AF: [67.7, 33.9], IQ: [43.7, 33.2],
  IR: [53.7, 32.4], SY: [38.0, 34.8],   LB: [35.9, 33.9],
  NZ: [174.9, -40.9], FJ: [179.0, -17.7], IE: [-8.2, 53.4], IS: [-19.0, 64.9],
  CU: [-77.8, 21.5], JM: [-77.3, 18.1], TT: [-61.0, 10.7], PR: [-66.6, 18.2],
};

export function WorldMap({ data }: { data: Country[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const isoMap = useMemo(() => {
    const m = new Map<string, Country>();
    for (const c of data) {
      const iso = countryToISO(c.country);
      if (iso) m.set(iso, c);
    }
    return m;
  }, [data]);

  const maxUsers = Math.max(...data.map((c) => c.users), 1);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MaplibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-light": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap &copy; CARTO",
          },
        },
        layers: [
          {
            id: "carto-light",
            type: "raster",
            source: "carto-light",
          },
        ],
      },
      center: [20, 20],
      zoom: 1.2,
      maxZoom: 6,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // --- Country polygons ---
      map.addSource("countries", {
        type: "geojson",
        data: WORLD_GEOJSON,
      });

      map.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "#c7d2fe",
          "fill-opacity": 0.3,
        },
      });

      map.addLayer({
        id: "countries-outline",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "rgba(0,0,0,0.12)",
          "line-width": 0.5,
        },
      });

      // --- Visitor point markers ---
      const pointFeatures = data
        .filter((c) => {
          const iso = countryToISO(c.country);
          return iso && CENTROIDS[iso];
        })
        .map((c) => {
          const iso = countryToISO(c.country)!;
          const [lng, lat] = CENTROIDS[iso];
          return {
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: [lng, lat] as [number, number] },
            properties: {
              country: c.country,
              users: c.users,
              sessions: c.sessions,
              size: 4 + (c.users / maxUsers) * 12,
            },
          };
        });

      map.addSource("visitors", {
        type: "geojson",
        data: { type: "FeatureCollection", features: pointFeatures },
      });

      // Outer glow ring
      map.addLayer({
        id: "visitor-glow",
        type: "circle",
        source: "visitors",
        paint: {
          "circle-radius": ["get", "size"],
          "circle-color": "#6366f1",
          "circle-opacity": 0.15,
          "circle-blur": 1,
        },
      });

      // Inner dot
      map.addLayer({
        id: "visitor-dot",
        type: "circle",
        source: "visitors",
        paint: {
          "circle-radius": ["*", ["get", "size"], 0.55],
          "circle-color": "#6366f1",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.9,
        },
      });

      // --- Hover on countries ---
      let hoveredId: string | number | null = null;
      const popup = new Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: "map-tooltip",
      });

      map.on("mousemove", "countries-fill", (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        const iso = feature.properties?.ISO_A2;
        const match = iso ? isoMap.get(iso) : undefined;

        if (hoveredId !== null) {
          map.setFeatureState({ source: "countries", id: hoveredId }, { hover: false });
        }
        hoveredId = feature.id ?? null;
        if (hoveredId !== null) {
          map.setFeatureState({ source: "countries", id: hoveredId }, { hover: true });
        }

        map.getCanvas().style.cursor = "default";

        if (match) {
          map.getCanvas().style.cursor = "pointer";
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-weight:600;font-size:13px">${match.country}</div>
               <div style="font-size:11px;color:#888">${match.users} users · ${match.sessions} sessions</div>`
            )
            .addTo(map);
        } else {
          popup.remove();
        }
      });

      map.on("mouseleave", "countries-fill", () => {
        if (hoveredId !== null) {
          map.setFeatureState({ source: "countries", id: hoveredId }, { hover: false });
          hoveredId = null;
        }
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // --- Hover on visitor dots ---
      map.on("mouseenter", "visitor-dot", (e) => {
        if (!e.features?.length) return;
        const f = e.features[0];
        const geom = f.geometry;
        if (geom.type !== "Point") return;
        map.getCanvas().style.cursor = "pointer";
        popup
          .setLngLat(geom.coordinates as [number, number])
          .setHTML(
            `<div style="font-weight:600;font-size:13px">${f.properties?.country}</div>
             <div style="font-size:11px;color:#888">${f.properties?.users} users · ${f.properties?.sessions} sessions</div>`
          )
          .addTo(map);
      });

      map.on("mouseleave", "visitor-dot", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // --- Fit bounds to data countries ---
      if (data.length > 0) {
        const bounds = new LngLatBounds();
        for (const c of data) {
          const iso = countryToISO(c.country);
          if (iso && CENTROIDS[iso]) {
            bounds.extend(CENTROIDS[iso]);
          }
        }
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 60, maxZoom: 4 });
        }
      }

      setMapReady(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isoMap, maxUsers, data]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-border/40"
        style={{ height: 340 }}
      />

      {data.length > 0 && mapReady && (
        <div className="absolute bottom-3 left-3 rounded-lg bg-card/90 backdrop-blur border border-border/40 px-3 py-2 text-xs text-muted-foreground">
          Hover for details
        </div>
      )}

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
