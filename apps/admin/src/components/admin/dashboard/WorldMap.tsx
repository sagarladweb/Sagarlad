"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Map as MaplibreMap, NavigationControl, Popup, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { countryToISO } from "@/lib/country-iso";

type Country = { country: string; users: number; sessions: number };
type NativeMap<K, V> = globalThis.Map<K, V>;

const WORLD_GEOJSON =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson";

export function WorldMap({ data }: { data: Country[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);

  const isoMap = useMemo(() => {
    const m = new globalThis.Map<string, Country>();
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
              "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
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
      map.addSource("countries", {
        type: "geojson",
        data: WORLD_GEOJSON,
      });

      // Country fills — countries with data get accent color
      map.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "rgba(99, 102, 241, 0.7)",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hasData"], false],
            0.7,
            0.06,
          ],
        },
      });

      // Country borders
      map.addLayer({
        id: "countries-outline",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "rgba(0,0,0,0.15)",
          "line-width": 0.5,
        },
      });

      // Set feature states for countries with GA data
      if (isoMap.size > 0) {
        const features = map.querySourceFeatures("countries");
        for (const f of features) {
          const iso = f.properties?.ISO_A2;
          if (iso && isoMap.has(iso)) {
            map.setFeatureState(
              { source: "countries", id: f.id },
              { hasData: true }
            );
          }
        }
      }

      // Hover effect
      let hoveredId: string | number | null = null;
      const popup = new Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        className: "map-tooltip",
      });

      map.on("mousemove", "countries-fill", (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        const iso = feature.properties?.ISO_A2;
        const match = iso ? isoMap.get(iso) : undefined;

        if (hoveredId !== null) {
          map.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: false }
          );
        }
        hoveredId = feature.id ?? null;
        if (hoveredId !== null) {
          map.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: true }
          );
        }

        map.getCanvas().style.cursor = match ? "pointer" : "";

        if (match) {
          setHoveredCountry(match);
          const coords = e.lngLat;
          popup
            .setLngLat(coords)
            .setHTML(
              `<div style="font-weight:600;font-size:13px">${match.country}</div>
               <div style="font-size:11px;color:#888">${match.users} users · ${match.sessions} sessions</div>`
            )
            .addTo(map);
        } else {
          setHoveredCountry(null);
          popup.remove();
        }
      });

      map.on("mouseleave", "countries-fill", () => {
        if (hoveredId !== null) {
          map.setFeatureState(
            { source: "countries", id: hoveredId },
            { hover: false }
          );
          hoveredId = null;
        }
        map.getCanvas().style.cursor = "";
        setHoveredCountry(null);
        popup.remove();
      });

      // Fit bounds to data countries if any
      if (data.length > 0) {
        const features = map.querySourceFeatures("countries", {
          sourceLayer: "",
          filter: [
            "in",
            "ISO_A2",
            ...Array.from(isoMap.keys()),
          ],
        });
        if (features.length > 0) {
          const bounds = new LngLatBounds();
          features.forEach((f) => {
            if (f.geometry.type === "Polygon") {
              f.geometry.coordinates.forEach((ring) =>
                ring.forEach((coord) => bounds.extend(coord as [number, number]))
              );
            } else if (f.geometry.type === "MultiPolygon") {
              f.geometry.coordinates.forEach((poly) =>
                poly.forEach((ring) =>
                  ring.forEach((coord) => bounds.extend(coord as [number, number]))
                )
              );
            }
          });
          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 40, maxZoom: 4 });
          }
        }
      }
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
