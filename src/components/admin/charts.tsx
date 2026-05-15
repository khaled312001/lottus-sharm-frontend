'use client';

// Lightweight, dependency-free SVG charts.
// Three primitives: AreaChart, BarChart, Donut.
import { useId } from 'react';

const BRAND = {
  primary: '#0d3a3a',
  primary2: '#134949',
  accent: '#c9a86a',
  accent2: '#d9bf86',
  rose: '#f43f5e',
  emerald: '#10b981',
  amber: '#f59e0b',
  blue: '#3b82f6',
  purple: '#a855f7',
  slate: '#94a3b8',
};

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const exp = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exp);
  let nice: number;
  if (fraction <= 1.5) nice = 1.5;
  else if (fraction <= 3) nice = 3;
  else if (fraction <= 5) nice = 5;
  else if (fraction <= 7.5) nice = 7.5;
  else nice = 10;
  return nice * Math.pow(10, exp);
}

interface SeriesPoint { label: string; value: number; sub?: number }

export function AreaChart({
  data,
  height = 220,
  color = BRAND.accent,
  valueFormat = (v: number) => Math.round(v).toLocaleString(),
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  valueFormat?: (v: number) => string;
}) {
  const gid = useId().replace(/:/g, '');
  if (data.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-8">لا توجد بيانات</div>;
  }
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const width = 800;
  const padX = 36;
  const padY = 24;
  const stepX = (width - padX * 2) / Math.max(data.length - 1, 1);
  const yScale = (v: number) => height - padY - (v / max) * (height - padY * 2);
  const xScale = (i: number) => padX + i * stepX;
  const pts = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(' ');
  const areaPath = `M ${padX},${height - padY} L ${pts.split(' ').join(' L ')} L ${xScale(data.length - 1)},${height - padY} Z`;
  const linePath = `M ${pts.split(' ').join(' L ')}`;

  // Tick lines (4 horizontal)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: yScale(max * t),
    label: valueFormat(max * t),
  }));

  // X-axis: show first, mid, last labels only
  const xLabels = [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padX} x2={width - padX} y1={t.y} y2={t.y} stroke="#e5e7eb" strokeDasharray="3 3" />
            <text x={padX - 6} y={t.y + 4} fontSize="10" textAnchor="end" fill="#94a3b8">{t.label}</text>
          </g>
        ))}

        {/* Area */}
        <path d={areaPath} fill={`url(#area-${gid})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xScale(i)} cy={yScale(d.value)} r="3" fill="white" stroke={color} strokeWidth="2" />
            <title>{d.label}: {valueFormat(d.value)}</title>
          </g>
        ))}

        {/* X-axis labels */}
        {xLabels.map((i) => (
          <text key={i} x={xScale(i)} y={height - 6} fontSize="10" textAnchor="middle" fill="#64748b">
            {data[i].label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function BarChart({
  data,
  height = 240,
  color = BRAND.primary,
  valueFormat = (v: number) => Math.round(v).toLocaleString(),
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  valueFormat?: (v: number) => string;
}) {
  if (data.length === 0) return <div className="text-center text-sm text-muted-foreground py-8">لا توجد بيانات</div>;
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const width = 800;
  const padX = 40;
  const padY = 28;
  const bandW = (width - padX * 2) / data.length;
  const barW = Math.min(48, bandW * 0.6);
  const yScale = (v: number) => height - padY - (v / max) * (height - padY * 2);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block" preserveAspectRatio="xMidYMid meet">
        {/* Y-axis grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <g key={i}>
            <line x1={padX} x2={width - padX} y1={yScale(max * t)} y2={yScale(max * t)} stroke="#e5e7eb" strokeDasharray="3 3" />
            <text x={padX - 6} y={yScale(max * t) + 4} fontSize="10" textAnchor="end" fill="#94a3b8">{valueFormat(max * t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padX + i * bandW + (bandW - barW) / 2;
          const y = yScale(d.value);
          const h = height - padY - y;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx="4" fill={color} opacity="0.9">
                <title>{d.label}: {valueFormat(d.value)}</title>
              </rect>
              <text x={x + barW / 2} y={y - 6} fontSize="10" textAnchor="middle" fill={color} fontWeight="700">{valueFormat(d.value)}</text>
              <text x={x + barW / 2} y={height - 8} fontSize="10" textAnchor="middle" fill="#64748b">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Donut({
  data,
  size = 180,
  thickness = 28,
  colors = [BRAND.amber, BRAND.emerald, BRAND.blue, BRAND.rose, BRAND.purple, BRAND.slate],
}: {
  data: { label: string; value: number }[];
  size?: number;
  thickness?: number;
  colors?: string[];
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  if (total === 0) return <div className="text-center text-sm text-muted-foreground py-8">لا توجد بيانات</div>;
  const r = size / 2 - thickness / 2;
  const c = size / 2;
  let cumulative = 0;
  const arcs = data.map((d, i) => {
    const startAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = c + r * Math.cos(startAngle);
    const y1 = c + r * Math.sin(startAngle);
    const x2 = c + r * Math.cos(endAngle);
    const y2 = c + r * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return {
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      color: colors[i % colors.length],
      label: d.label,
      value: d.value,
      pct: (d.value / total) * 100,
    };
  });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        {arcs.map((a, i) => (
          <path
            key={i}
            d={a.path}
            fill="none"
            stroke={a.color}
            strokeWidth={thickness}
            strokeLinecap="butt"
          >
            <title>{a.label}: {a.value} ({a.pct.toFixed(1)}%)</title>
          </path>
        ))}
        <text x={c} y={c - 2} textAnchor="middle" fontSize="20" fontWeight="800" fill={BRAND.primary}>{total}</text>
        <text x={c} y={c + 16} textAnchor="middle" fontSize="10" fill="#64748b">الإجمالي</text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {arcs.map((a, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: a.color }} />
            <span className="text-foreground/80">{a.label}</span>
            <span className="text-muted-foreground text-xs">{a.value} ({a.pct.toFixed(0)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StackedBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  if (total === 0) return <div className="text-center text-sm text-muted-foreground py-4">لا توجد بيانات</div>;
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        {segments.map((s, i) => (
          <div key={i} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} title={`${s.label}: ${s.value}`} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-1.5 text-xs">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-foreground/80 truncate">{s.label}</span>
            <span className="text-muted-foreground ms-auto tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
