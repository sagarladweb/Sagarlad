"use client";

import { useState } from "react";

type Country = { country: string; users: number; sessions: number };

// Approximate centroids (lat, lng) for top countries → SVG viewport coords
// Viewport: 1000 x 500 (Mercator-ish)
const COUNTRY_COORDS: Record<string, [number, number]> = {
  India: [680, 220],
  "United States": [220, 180],
  "United Kingdom": [480, 140],
  Germany: [510, 145],
  Canada: [230, 130],
  Australia: [790, 370],
  Brazil: [310, 330],
  France: [490, 155],
  Japan: [810, 185],
  "South Korea": [790, 195],
  Netherlands: [500, 140],
  Singapore: [740, 275],
  UAE: [600, 215],
  "Saudi Arabia": [575, 215],
  Nigeria: [500, 250],
  "South Africa": [530, 365],
  Mexico: [200, 225],
  Italy: [510, 160],
  Spain: [475, 165],
  Indonesia: [750, 290],
  Russia: [600, 110],
  China: [740, 195],
  Turkey: [545, 175],
  Egypt: [545, 210],
  Kenya: [545, 270],
  Argentina: [290, 380],
  Poland: [520, 135],
  Sweden: [510, 105],
  "New Zealand": [840, 390],
  Pakistan: [640, 210],
  Bangladesh: [700, 225],
  Philippines: [780, 250],
  Vietnam: [755, 240],
  Thailand: [735, 245],
  Malaysia: [745, 270],
  Taiwan: [790, 215],
};

function toSvg(lng: number, lat: number): [number, number] {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return [x, y];
}

function CountryDot({
  country,
  users,
  maxUsers,
  index,
}: {
  country: string;
  users: number;
  maxUsers: number;
  index: number;
}) {
  const coords = COUNTRY_COORDS[country];
  if (!coords) return null;
  const [x, y] = toSvg(coords[1], coords[0]);
  const r = 3 + (users / maxUsers) * 8;
  const opacity = 0.3 + (users / maxUsers) * 0.7;

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r + 4}
        fill="var(--accent)"
        opacity={opacity * 0.15}
        className="animate-pulse"
        style={{ animationDelay: `${index * 100}ms`, animationDuration: "3s" }}
      />
      <circle cx={x} cy={y} r={r} fill="var(--accent)" opacity={opacity} />
    </g>
  );
}

export function WorldMap({ data }: { data: Country[] }) {
  const [hovered, setHovered] = useState<Country | null>(null);
  const maxUsers = Math.max(...data.map((c) => c.users), 1);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No location data yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-auto"
        style={{ maxHeight: "280px" }}
      >
        {/* Simple world outline */}
        <rect
          x="0"
          y="0"
          width="1000"
          height="500"
          fill="none"
          stroke="var(--border)"
          strokeWidth="0.5"
          opacity="0.3"
          rx="8"
        />

        {/* Grid lines */}
        {[0, 125, 250, 375, 500, 625, 750, 875, 1000].map((x) => (
          <line
            key={`v${x}`}
            x1={x}
            y1={0}
            x2={x}
            y2={500}
            stroke="var(--border)"
            strokeWidth="0.3"
            opacity="0.15"
          />
        ))}
        {[0, 100, 200, 300, 400, 500].map((y) => (
          <line
            key={`h${y}`}
            x1={0}
            y1={y}
            x2={1000}
            y2={y}
            stroke="var(--border)"
            strokeWidth="0.3"
            opacity="0.15"
          />
        ))}

        {/* Country dots */}
        {data.map((c, i) => (
          <g
            key={c.country}
            onMouseEnter={() => setHovered(c)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
          >
            <CountryDot country={c.country} users={c.users} maxUsers={maxUsers} index={i} />
            {/* Invisible larger hit area */}
            {COUNTRY_COORDS[c.country] && (
              <circle
                cx={toSvg(COUNTRY_COORDS[c.country][1], COUNTRY_COORDS[c.country][0])[0]}
                cy={toSvg(COUNTRY_COORDS[c.country][1], COUNTRY_COORDS[c.country][0])[1]}
                r="15"
                fill="transparent"
              />
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered && COUNTRY_COORDS[hovered.country] && (
        <div
          className="absolute z-10 px-3 py-2 rounded-lg border border-border bg-card text-sm pointer-events-none"
          style={{
            left: `${((toSvg(COUNTRY_COORDS[hovered.country][1], COUNTRY_COORDS[hovered.country][0])[0] / 1000) * 100)}%`,
            top: `${((toSvg(COUNTRY_COORDS[hovered.country][1], COUNTRY_COORDS[hovered.country][0])[1] / 500) * 100) - 8}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="font-medium">{hovered.country}</p>
          <p className="text-xs text-muted-foreground">
            {hovered.users} users · {hovered.sessions} sessions
          </p>
        </div>
      )}

      {/* Country list */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        {data.map((c) => (
          <div key={c.country} className="flex items-center justify-between gap-2">
            <span className="truncate text-muted-foreground">{c.country}</span>
            <span className="tabular-nums font-medium">{c.users}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
