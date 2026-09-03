"use client";

import { useState } from "react";

type Country = { country: string; users: number; sessions: number };

// ISO 3166-1 country names from GA4 → approximate centroid [lat, lng]
const COUNTRY_COORDS: Record<string, [number, number]> = {
  India: [20.5937, 78.9629],
  "United States": [37.0902, -95.7129],
  "United Kingdom": [55.3781, -3.436],
  Germany: [51.1657, 10.4515],
  Canada: [56.1304, -106.3468],
  Australia: [-25.2744, 133.7751],
  Brazil: [-14.235, -51.9253],
  France: [46.2276, 2.2137],
  Japan: [36.2048, 138.2529],
  "South Korea": [35.9078, 127.7669],
  Netherlands: [52.1326, 5.2913],
  Singapore: [1.3521, 103.8198],
  "United Arab Emirates": [23.4241, 53.8478],
  UAE: [23.4241, 53.8478],
  "Saudi Arabia": [23.8859, 45.0792],
  Nigeria: [9.082, 8.6753],
  "South Africa": [-30.5595, 22.9375],
  Mexico: [23.6345, -102.5528],
  Italy: [41.8719, 12.5674],
  Spain: [40.4637, -3.7492],
  Indonesia: [-0.7893, 113.9213],
  Russia: [61.524, 105.3188],
  China: [35.8617, 104.1954],
  Turkey: [38.9637, 35.2433],
  Egypt: [26.8206, 30.8025],
  Kenya: [-0.0236, 37.9062],
  Argentina: [-38.4161, -63.6167],
  Poland: [51.9194, 19.1451],
  Sweden: [60.1282, 18.6435],
  "New Zealand": [-40.9006, 174.886],
  Pakistan: [30.3753, 69.3451],
  Bangladesh: [23.685, 90.3563],
  Philippines: [12.8797, 121.774],
  Vietnam: [14.0583, 108.2772],
  Thailand: [15.87, 100.9925],
  Malaysia: [4.2105, 101.9758],
  Taiwan: [23.6978, 120.9605],
  Colombia: [4.5709, -74.2973],
  Peru: [-9.19, -75.0152],
  Chile: [-35.6751, -71.543],
  "Sri Lanka": [7.8731, 80.7718],
  Nepal: [28.3949, 84.124],
  "Hong Kong": [22.3193, 114.1694],
  Morocco: [31.7917, -7.0926],
  Greece: [39.0742, 21.8243],
  Portugal: [39.3999, -8.2245],
  Ireland: [53.1424, -7.6921],
  Austria: [47.5162, 14.5501],
  Switzerland: [46.8182, 8.2275],
  Belgium: [50.5039, 4.4699],
  Denmark: [56.2639, 9.5018],
  Finland: [61.9241, 25.7482],
  Norway: [60.472, 8.4689],
  Czechia: [49.8175, 15.473],
  Romania: [45.9432, 24.9668],
  Hungary: [47.1625, 19.5033],
  Ukraine: [48.3794, 31.1656],
  Israel: [31.0461, 34.8516],
};

// Mercator projection: lat/lng → SVG coords (1000×500 viewport)
function project(lng: number, lat: number): [number, number] {
  const x = ((lng + 180) / 360) * 1000;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 250 - (mercN / Math.PI) * 250;
  return [x, Math.max(10, Math.min(490, y))];
}

// Simple world landmass outline (simplified Mercator paths)
const WORLD_PATH =
  "M148,112 L155,108 L165,105 L178,108 L185,115 L180,125 L170,130 L162,128 " +
  "M188,105 L205,98 L218,100 L230,108 L225,118 L215,122 L200,120 L190,115 " +
  "M232,108 L250,102 L265,105 L275,112 L270,120 L258,125 L245,122 L235,115 " +
  "M278,110 L300,100 L320,98 L335,102 L340,110 L330,118 L315,122 L300,120 L285,118 " +
  "M345,100 L365,95 L380,98 L390,105 L385,115 L370,120 L355,118 L345,110 " +
  "M395,98 L420,92 L440,95 L455,100 L460,110 L450,118 L435,120 L420,118 L405,112 " +
  "M462,105 L480,98 L500,95 L520,100 L530,110 L525,120 L510,125 L495,122 L480,118 L468,112 " +
  "M535,108 L555,102 L575,105 L590,112 L585,122 L570,128 L555,125 L540,118 " +
  "M595,110 L620,105 L640,108 L655,115 L650,125 L635,130 L620,128 L605,122 " +
  "M660,112 L685,108 L705,112 L720,118 L715,128 L700,132 L685,130 L670,125 " +
  "M725,115 L750,110 L770,115 L785,122 L780,132 L765,135 L750,132 L735,128 " +
  "M790,118 L810,112 L825,115 L835,122 L830,130 L815,135 L800,132 L792,125 " +
  "M148,140 L165,135 L180,138 L195,145 L190,155 L175,160 L160,155 L150,148 " +
  "M200,142 L225,138 L245,142 L260,150 L255,160 L240,165 L225,162 L210,155 " +
  "M265,145 L290,140 L310,142 L325,150 L320,160 L305,165 L290,162 L275,155 " +
  "M330,142 L355,138 L375,140 L390,148 L385,158 L370,162 L355,160 L340,152 " +
  "M395,140 L420,135 L440,138 L455,145 L450,155 L435,160 L420,158 L405,150 " +
  "M460,142 L485,138 L505,140 L520,148 L515,158 L500,162 L485,160 L470,152 " +
  "M525,145 L550,140 L570,142 L585,150 L580,160 L565,165 L550,162 L535,155 " +
  "M590,142 L615,138 L635,140 L650,148 L645,158 L630,162 L615,160 L600,152 " +
  "M655,145 L680,140 L700,142 L715,150 L710,160 L695,165 L680,162 L665,155 " +
  "M720,148 L745,142 L765,145 L780,152 L775,162 L760,165 L745,162 L730,158 " +
  "M155,170 L175,165 L190,168 L205,175 L200,185 L185,190 L170,188 L160,180 " +
  "M210,172 L235,168 L255,170 L270,178 L265,188 L250,192 L235,190 L220,182 " +
  "M275,175 L300,170 L320,172 L335,180 L330,190 L315,195 L300,192 L285,185 " +
  "M340,172 L365,168 L385,170 L400,178 L395,188 L380,192 L365,190 L350,182 " +
  "M405,170 L430,165 L450,168 L465,175 L460,185 L445,190 L430,188 L415,180 " +
  "M470,172 L495,168 L515,170 L530,178 L525,188 L510,192 L495,190 L480,182 " +
  "M535,175 L560,170 L580,172 L595,180 L590,190 L575,195 L560,192 L545,185 " +
  "M600,172 L625,168 L645,170 L660,178 L655,188 L640,192 L625,190 L610,182 " +
  "M665,175 L690,170 L710,172 L725,180 L720,190 L705,195 L690,192 L675,185 " +
  "M730,178 L755,172 L775,175 L790,182 L785,192 L770,195 L755,192 L740,188 " +
  "M160,200 L180,195 L195,198 L210,205 L205,215 L190,220 L175,218 L165,210 " +
  "M215,202 L240,198 L260,200 L275,208 L270,218 L255,222 L240,220 L225,212 " +
  "M280,205 L305,200 L325,202 L340,210 L335,220 L320,225 L305,222 L290,215 " +
  "M345,202 L370,198 L390,200 L405,208 L400,218 L385,222 L370,220 L355,212 " +
  "M410,200 L435,195 L455,198 L470,205 L465,215 L450,220 L435,218 L420,210 " +
  "M475,202 L500,198 L520,200 L535,208 L530,218 L515,222 L500,220 L485,212 " +
  "M540,205 L565,200 L585,202 L600,210 L595,220 L580,225 L565,222 L550,215 " +
  "M605,202 L630,198 L650,200 L665,208 L660,218 L645,222 L630,220 L615,212 " +
  "M670,205 L695,200 L715,202 L730,210 L725,220 L710,225 L695,222 L680,215 " +
  "M735,208 L760,202 L780,205 L795,212 L790,222 L775,225 L760,222 L745,218 " +
  "M165,232 L185,228 L200,230 L215,238 L210,248 L195,252 L180,250 L170,242 " +
  "M220,235 L245,230 L265,232 L280,240 L275,250 L260,255 L245,252 L230,245 " +
  "M285,238 L310,232 L330,235 L345,242 L340,252 L325,255 L310,252 L295,248 " +
  "M350,235 L375,230 L395,232 L410,240 L405,250 L390,255 L375,252 L360,245 " +
  "M415,232 L440,228 L460,230 L475,238 L470,248 L455,252 L440,250 L425,242 " +
  "M480,235 L505,230 L525,232 L540,240 L535,250 L520,255 L505,252 L490,245 " +
  "M545,238 L570,232 L590,235 L605,242 L600,252 L585,255 L570,252 L555,248 " +
  "M610,235 L635,230 L655,232 L670,240 L665,250 L650,255 L635,252 L620,245 " +
  "M675,238 L700,232 L720,235 L735,242 L730,252 L715,255 L700,252 L685,248 " +
  "M740,240 L765,235 L785,238 L800,245 L795,255 L780,258 L765,255 L750,250 " +
  "M170,265 L190,260 L205,262 L220,270 L215,280 L200,285 L185,282 L175,275 " +
  "M225,268 L250,262 L270,265 L285,272 L280,282 L265,285 L250,282 L235,278 " +
  "M290,265 L315,260 L335,262 L350,270 L345,280 L330,285 L315,282 L300,275 " +
  "M355,262 L380,258 L400,260 L415,268 L410,278 L395,282 L380,280 L365,272 " +
  "M420,260 L445,255 L465,258 L480,265 L475,275 L460,280 L445,278 L430,270 " +
  "M485,262 L510,258 L530,260 L545,268 L540,278 L525,282 L510,280 L495,272 " +
  "M550,265 L575,260 L595,262 L610,270 L605,280 L590,285 L575,282 L560,275 " +
  "M615,262 L640,258 L660,260 L675,268 L670,278 L655,282 L640,280 L625,272 " +
  "M680,265 L705,260 L725,262 L740,270 L735,280 L720,285 L705,282 L690,275 " +
  "M745,268 L770,262 L790,265 L805,272 L800,282 L785,285 L770,282 L755,278 " +
  "M175,298 L195,292 L210,295 L225,302 L220,312 L205,315 L190,312 L180,308 " +
  "M230,295 L255,290 L275,292 L290,300 L285,310 L270,315 L255,312 L240,305 " +
  "M295,292 L320,288 L340,290 L355,298 L350,308 L335,312 L320,310 L305,302 " +
  "M360,290 L385,285 L405,288 L420,295 L415,305 L400,310 L385,308 L370,300 " +
  "M425,288 L450,282 L470,285 L485,292 L480,302 L465,308 L450,305 L435,298 " +
  "M490,290 L515,285 L535,288 L550,295 L545,305 L530,310 L515,308 L500,300 " +
  "M555,292 L580,288 L600,290 L615,298 L610,308 L595,312 L580,310 L565,302 " +
  "M620,290 L645,285 L665,288 L680,295 L675,305 L660,310 L645,308 L630,300 " +
  "M685,292 L710,288 L730,290 L745,298 L740,308 L725,312 L710,310 L695,302 " +
  "M750,295 L775,290 L795,292 L810,300 L805,310 L790,312 L775,310 L760,305 " +
  "M180,330 L200,325 L215,328 L230,335 L225,345 L210,350 L195,347 L185,340 " +
  "M235,328 L260,322 L280,325 L295,332 L290,342 L275,345 L260,342 L245,338 " +
  "M300,325 L325,320 L345,322 L360,330 L355,340 L340,345 L325,342 L310,335 " +
  "M365,322 L390,318 L410,320 L425,328 L420,338 L405,342 L390,340 L375,332 " +
  "M430,320 L455,315 L475,318 L490,325 L485,335 L470,340 L455,338 L440,330 " +
  "M495,322 L520,318 L540,320 L555,328 L550,338 L535,342 L520,340 L505,332 " +
  "M560,325 L585,320 L605,322 L620,330 L615,340 L600,345 L585,342 L570,335 " +
  "M625,322 L650,318 L670,320 L685,328 L680,338 L665,342 L650,340 L635,332 " +
  "M690,325 L715,320 L735,322 L750,330 L745,340 L730,345 L715,342 L700,335 " +
  "M755,328 L780,322 L800,325 L815,332 L810,342 L795,345 L780,342 L765,338 " +
  "M185,362 L205,358 L220,360 L235,368 L230,378 L215,382 L200,380 L190,372 " +
  "M240,360 L265,355 L285,358 L300,365 L295,375 L280,378 L265,375 L250,370 " +
  "M305,358 L330,352 L350,355 L365,362 L360,372 L345,378 L330,375 L315,368 " +
  "M370,355 L395,350 L415,352 L430,360 L425,370 L410,375 L395,372 L380,365 " +
  "M435,352 L460,348 L480,350 L495,358 L490,368 L475,372 L460,370 L445,362 " +
  "M500,355 L525,350 L545,352 L560,360 L555,370 L540,375 L525,372 L510,365 " +
  "M565,358 L590,352 L610,355 L625,362 L620,372 L605,378 L590,375 L575,368 " +
  "M630,355 L655,350 L675,352 L690,360 L685,370 L670,375 L655,372 L640,365 " +
  "M695,358 L720,352 L740,355 L755,362 L750,372 L735,378 L720,375 L705,368 " +
  "M760,360 L785,355 L805,358 L820,365 L815,375 L800,378 L785,375 L770,370 " +
  "M190,395 L210,390 L225,392 L240,400 L235,410 L220,415 L205,412 L195,405 " +
  "M245,392 L270,388 L290,390 L305,398 L300,408 L285,412 L270,410 L255,402 " +
  "M310,390 L335,385 L355,388 L370,395 L365,405 L350,410 L335,408 L320,400 " +
  "M375,388 L400,382 L420,385 L435,392 L430,402 L415,408 L400,405 L385,398 " +
  "M440,385 L465,380 L485,382 L500,390 L495,400 L480,405 L465,402 L450,395 " +
  "M505,388 L530,382 L550,385 L565,392 L560,402 L545,408 L530,405 L515,398 " +
  "M570,385 L595,380 L615,382 L630,390 L625,400 L610,405 L595,402 L580,395 " +
  "M635,388 L660,382 L680,385 L695,392 L690,402 L675,408 L660,405 L645,398 " +
  "M700,385 L725,380 L745,382 L760,390 L755,400 L740,405 L725,402 L710,395 " +
  "M765,388 L790,382 L810,385 L825,392 L820,402 L805,408 L790,405 L775,398 " +
  "M195,428 L215,423 L230,425 L245,433 L240,443 L225,448 L210,445 L200,438 " +
  "M250,425 L275,420 L295,422 L310,430 L305,440 L290,445 L275,442 L260,435 " +
  "M315,422 L340,418 L360,420 L375,428 L370,438 L355,442 L340,440 L325,432 " +
  "M380,420 L405,415 L425,418 L440,425 L435,435 L420,440 L405,438 L390,430 " +
  "M445,418 L470,412 L490,415 L505,422 L500,432 L485,438 L470,435 L455,428 " +
  "M510,420 L535,415 L555,418 L570,425 L565,435 L550,440 L535,438 L520,430 " +
  "M575,418 L600,412 L620,415 L635,422 L630,432 L615,438 L600,435 L585,428 " +
  "M640,420 L665,415 L685,418 L700,425 L695,435 L680,440 L665,438 L650,430 " +
  "M705,418 L730,412 L750,415 L765,422 L760,432 L745,438 L730,435 L715,428 " +
  "M770,420 L795,415 L815,418 L830,425 L825,435 L810,440 L795,438 L780,430";

export function WorldMap({ data }: { data: Country[] }) {
  const [hovered, setHovered] = useState<Country | null>(null);
  const maxUsers = Math.max(...data.map((c) => c.users), 1);

  return (
    <div className="relative">
      {/* Map container */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-b from-muted/20 to-muted/5">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-auto select-none"
          style={{ maxHeight: "320px" }}
          aria-label="World map showing visitor locations"
        >
          <defs>
            <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
            <filter id="dot-blur">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>

          {/* World land outline */}
          <path
            d={WORLD_PATH}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1.2"
            opacity="0.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Subtle grid */}
          {[0, 200, 400, 600, 800, 1000].map((x) => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={500} stroke="var(--border)" strokeWidth="0.3" opacity="0.08" />
          ))}
          {[0, 125, 250, 375, 500].map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="var(--border)" strokeWidth="0.3" opacity="0.08" />
          ))}

          {/* Country dots with glow */}
          {data.map((c, i) => {
            const coords = COUNTRY_COORDS[c.country];
            if (!coords) return null;
            const [x, y] = project(coords[1], coords[0]);
            const intensity = c.users / maxUsers;
            const r = 4 + intensity * 10;

            return (
              <g
                key={c.country}
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer"
              >
                {/* Outer glow */}
                <circle cx={x} cy={y} r={r + 12} fill="url(#dot-glow)" opacity={intensity * 0.4} />
                {/* Pulse ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={r + 6}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1"
                  opacity={intensity * 0.3}
                  className="animate-ping"
                  style={{ animationDelay: `${i * 150}ms`, animationDuration: "3s" }}
                />
                {/* Core dot */}
                <circle cx={x} cy={y} r={r} fill="var(--accent)" opacity={0.5 + intensity * 0.5} />
                {/* Bright center */}
                <circle cx={x} cy={y} r={r * 0.35} fill="white" opacity={0.6 + intensity * 0.4} />
                {/* Invisible hit area */}
                <circle cx={x} cy={y} r="18" fill="transparent" />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hovered && COUNTRY_COORDS[hovered.country] && (
          <div
            className="absolute z-10 px-3 py-2 rounded-lg border border-border/60 bg-card/95 backdrop-blur-sm text-sm shadow-lg pointer-events-none transition-opacity duration-150"
            style={{
              left: `${(project(COUNTRY_COORDS[hovered.country][1], COUNTRY_COORDS[hovered.country][0])[0] / 1000) * 100}%`,
              top: `${(project(COUNTRY_COORDS[hovered.country][1], COUNTRY_COORDS[hovered.country][0])[1] / 500) * 100 - 6}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-semibold">{hovered.country}</p>
            <p className="text-xs text-muted-foreground">
              {hovered.users} users · {hovered.sessions} sessions
            </p>
          </div>
        )}
      </div>

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
                    opacity: 0.5 + intensity * 0.5,
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
