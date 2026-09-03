"use client";

type Country = { country: string; users: number; sessions: number };

export function WorldMap({ data }: { data: Country[] }) {
  const maxUsers = Math.max(...data.map((c) => c.users), 1);

  if (data.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-center text-sm text-muted-foreground">
        No location data yet. Configure GA_PROPERTY_ID to see visitor countries.
      </div>
    );
  }

  const W = 800;
  const H = 220;
  const PAD_LEFT = 10;
  const PAD_RIGHT = 10;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 40;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;
  const barGap = 6;
  const barW = Math.min(60, (chartW - barGap * (data.length - 1)) / data.length);

  return (
    <div style={{ height: H }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="w-full block"
        role="img"
        aria-label="Visitors by country"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = PAD_TOP + chartH - f * chartH;
          const val = Math.round(maxUsers * f);
          return (
            <g key={f}>
              <line x1={PAD_LEFT} x2={W - PAD_RIGHT} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
              <text x={PAD_LEFT} y={y - 5} fontSize="9" fill="var(--muted-foreground)">{val}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((c, i) => {
          const barH = (c.users / maxUsers) * chartH;
          const x = PAD_LEFT + i * (barW + barGap) + (chartW - data.length * (barW + barGap) + barGap) / 2;
          const y = PAD_TOP + chartH - barH;
          return (
            <g key={c.country}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill="#6366f1"
                opacity="0.85"
              />
              {/* Value on top */}
              <text
                x={x + barW / 2}
                y={y - 5}
                fontSize="10"
                fontWeight="600"
                fill="var(--foreground)"
                textAnchor="middle"
              >
                {c.users}
              </text>
              {/* Country label */}
              <text
                x={x + barW / 2}
                y={H - 10}
                fontSize="9"
                fill="var(--muted-foreground)"
                textAnchor="middle"
              >
                {c.country.length > 8 ? c.country.slice(0, 7) + "…" : c.country}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
