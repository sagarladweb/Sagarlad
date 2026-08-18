export function chartGeometry(
  values: number[],
  w: number,
  h: number
): { line: string; area: string; max: number } {
  const max = Math.max(...values, 1);
  const n = values.length;
  const step = n > 1 ? w / (n - 1) : 0;
  const pts = values.map((v, i) => [
    i * step,
    h - (v / max) * (h - 2) - 1,
  ]);

  if (pts.length < 2) {
    return { line: "", area: "", max };
  }

  let line = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    line += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }

  const area = `${line} L ${pts[pts.length - 1][0]},${h} L ${pts[0][0]},${h} Z`;
  return { line, area, max };
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
