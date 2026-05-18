'use client';

// Lightweight, dependency-free SVG charts with full interactivity:
// - Hover tooltips that follow the cursor
// - Hover highlight on bar / dot / arc
// - Optional onClick to drill in
// - Donut legend items toggle visibility
import { useId, useState, useRef, type MouseEvent as RMouseEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

// =================== Shared tooltip ===================
function ChartTooltip({
  visible, x, y, title, value, sub, color, containerWidth,
}: {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  value: string;
  sub?: string;
  color: string;
  containerWidth: number;
}) {
  if (!visible) return null;
  // keep tooltip inside container
  const w = 160;
  const left = Math.max(8, Math.min(containerWidth - w - 8, x - w / 2));
  return (
    <div
      className="absolute z-20 pointer-events-none transition-opacity"
      style={{ left, top: Math.max(8, y - 70), width: w }}
    >
      <div className="bg-primary text-cream rounded-lg shadow-2xl shadow-primary-900/30 border border-accent/30 px-3 py-2 text-xs">
        <div className="font-bold mb-0.5 truncate">{title}</div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="font-mono font-bold text-base tabular-nums">{value}</span>
        </div>
        {sub && <div className="text-[10px] opacity-80 mt-0.5">{sub}</div>}
      </div>
      {/* Pointer arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-primary border-e border-b border-accent/30" />
    </div>
  );
}

// =================== Area Chart ===================
export function AreaChart({
  data,
  height = 220,
  color = BRAND.accent,
  valueFormat = (v: number) => Math.round(v).toLocaleString(),
  onPointClick,
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  valueFormat?: (v: number) => string;
  onPointClick?: (index: number, point: SeriesPoint) => void;
}) {
  const gid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [pixelW, setPixelW] = useState(800);

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

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: yScale(max * t),
    label: valueFormat(max * t),
  }));
  const xLabels = [0, Math.floor(data.length / 2), data.length - 1];

  // Map a mouse X (in SVG userspace) → nearest data index
  const handleMove = (e: RMouseEvent<SVGRectElement>) => {
    const svg = (e.currentTarget.ownerSVGElement) as SVGSVGElement | null;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setPixelW(rect.width);
    const svgX = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.round((svgX - padX) / stepX);
    if (idx >= 0 && idx < data.length) setHover(idx);
  };

  const hoveredX = hover !== null ? xScale(hover) : 0;
  const hoveredY = hover !== null ? yScale(data[hover].value) : 0;
  // Convert SVG x/y → pixel position for the tooltip div
  const pixelX = (hoveredX / width) * pixelW;
  const pixelY = (hoveredY / height) * (pixelW * (height / width));

  return (
    <div ref={containerRef} className="w-full relative overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padX} x2={width - padX} y1={t.y} y2={t.y} stroke="#e5e7eb" strokeDasharray="3 3" />
            <text x={padX - 6} y={t.y + 4} fontSize="10" textAnchor="end" fill="#94a3b8">{t.label}</text>
          </g>
        ))}

        <motion.path
          d={areaPath}
          fill={`url(#area-${gid})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Crosshair vertical line on hover */}
        {hover !== null && (
          <line
            x1={hoveredX}
            x2={hoveredX}
            y1={padY}
            y2={height - padY}
            stroke={color}
            strokeOpacity="0.3"
            strokeDasharray="4 3"
          />
        )}

        {data.map((d, i) => {
          const isHover = hover === i;
          return (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, delay: 1.0 + (i / data.length) * 0.4 }}
              style={{ transformOrigin: `${xScale(i)}px ${yScale(d.value)}px` }}
            >
              <circle
                cx={xScale(i)}
                cy={yScale(d.value)}
                r={isHover ? 6 : 3}
                fill="white"
                stroke={color}
                strokeWidth={isHover ? 3 : 2}
                style={{ transition: 'r 0.15s, stroke-width 0.15s' }}
              />
              {isHover && (
                <circle cx={xScale(i)} cy={yScale(d.value)} r={11} fill={color} opacity="0.15" />
              )}
            </motion.g>
          );
        })}

        {xLabels.map((i) => (
          <text key={i} x={xScale(i)} y={height - 6} fontSize="10" textAnchor="middle" fill="#64748b">
            {data[i].label}
          </text>
        ))}

        {/* Invisible interaction overlay */}
        <rect
          x={padX}
          y={padY}
          width={width - padX * 2}
          height={height - padY * 2}
          fill="transparent"
          style={{ cursor: onPointClick ? 'pointer' : 'crosshair' }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          onClick={() => hover !== null && onPointClick?.(hover, data[hover])}
        />
      </svg>

      {hover !== null && (
        <ChartTooltip
          visible
          x={pixelX}
          y={pixelY}
          title={data[hover].label}
          value={valueFormat(data[hover].value)}
          sub={data[hover].sub !== undefined ? `sub: ${data[hover].sub}` : undefined}
          color={color}
          containerWidth={pixelW}
        />
      )}
    </div>
  );
}

// =================== Bar Chart ===================
export function BarChart({
  data,
  height = 240,
  color = BRAND.primary,
  valueFormat = (v: number) => Math.round(v).toLocaleString(),
  onBarClick,
}: {
  data: SeriesPoint[];
  height?: number;
  color?: string;
  valueFormat?: (v: number) => string;
  onBarClick?: (index: number, point: SeriesPoint) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [pixelW, setPixelW] = useState(800);
  const svgRef = useRef<SVGSVGElement>(null);

  if (data.length === 0) return <div className="text-center text-sm text-muted-foreground py-8">لا توجد بيانات</div>;
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const width = 800;
  const padX = 40;
  const padY = 28;
  const bandW = (width - padX * 2) / data.length;
  const barW = Math.min(48, bandW * 0.6);
  const yScale = (v: number) => height - padY - (v / max) * (height - padY * 2);

  const trackWidth = () => {
    if (svgRef.current) setPixelW(svgRef.current.getBoundingClientRect().width);
  };

  return (
    <div className="w-full relative overflow-x-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block"
        preserveAspectRatio="xMidYMid meet"
        onMouseEnter={trackWidth}
        onMouseLeave={() => setHover(null)}
      >
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
          const delay = 0.15 + i * 0.05;
          const isHover = hover === i;
          return (
            <g key={i} style={{ cursor: onBarClick ? 'pointer' : 'default' }}>
              {/* Invisible wider hover hit area for the whole band */}
              <rect
                x={padX + i * bandW}
                y={padY}
                width={bandW}
                height={height - padY * 2}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onClick={() => onBarClick?.(i, d)}
              />
              <motion.rect
                x={x}
                width={barW}
                rx="4"
                fill={color}
                opacity={isHover ? 1 : 0.85}
                initial={{ y: height - padY, height: 0 }}
                animate={{ y, height: h }}
                transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
                pointerEvents="none"
              />
              {isHover && (
                <rect
                  x={x - 2}
                  y={y - 2}
                  width={barW + 4}
                  height={h + 2}
                  rx="5"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  pointerEvents="none"
                />
              )}
              <motion.text
                x={x + barW / 2}
                y={y - 6}
                fontSize="10"
                textAnchor="middle"
                fill={color}
                fontWeight="700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.5 }}
                pointerEvents="none"
              >
                {valueFormat(d.value)}
              </motion.text>
              <text x={x + barW / 2} y={height - 8} fontSize="10" textAnchor="middle" fill="#64748b" pointerEvents="none">{d.label}</text>
            </g>
          );
        })}
      </svg>

      {hover !== null && (() => {
        const x = padX + hover * bandW + bandW / 2;
        const y = yScale(data[hover].value);
        const pixelX = (x / width) * pixelW;
        const pixelY = (y / height) * (pixelW * (height / width));
        return (
          <ChartTooltip
            visible
            x={pixelX}
            y={pixelY}
            title={data[hover].label}
            value={valueFormat(data[hover].value)}
            color={color}
            containerWidth={pixelW}
          />
        );
      })()}
    </div>
  );
}

// =================== Donut Chart ===================
export function Donut({
  data,
  size = 180,
  thickness = 28,
  colors = [BRAND.amber, BRAND.emerald, BRAND.blue, BRAND.rose, BRAND.purple, BRAND.slate],
  onSliceClick,
}: {
  data: { label: string; value: number }[];
  size?: number;
  thickness?: number;
  colors?: string[];
  onSliceClick?: (index: number, slice: { label: string; value: number }) => void;
}) {
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [hover, setHover] = useState<number | null>(null);

  const visible = data.map((d, i) => ({ ...d, _i: i })).filter((d) => !hidden.has(d._i));
  const total = visible.reduce((acc, d) => acc + d.value, 0);
  if (data.length === 0 || total === 0) return <div className="text-center text-sm text-muted-foreground py-8">لا توجد بيانات</div>;
  const r = size / 2 - thickness / 2;
  const c = size / 2;
  let cumulative = 0;
  const arcs = visible.map((d, i) => {
    const startAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = c + r * Math.cos(startAngle);
    const y1 = c + r * Math.sin(startAngle);
    const x2 = c + r * Math.cos(endAngle);
    const y2 = c + r * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    return {
      origIdx: d._i,
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      color: colors[d._i % colors.length],
      label: d.label,
      value: d.value,
      pct: (d.value / total) * 100,
    };
  });

  const toggle = (i: number) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      // never hide all
      if (next.size === data.length) return prev;
      return next;
    });
  };

  const hoveredArc = hover !== null ? arcs.find((a) => a.origIdx === hover) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 justify-center">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={c} cy={c} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
          {arcs.map((a, i) => {
            const isHover = hover === a.origIdx;
            return (
              <motion.path
                key={a.origIdx}
                d={a.path}
                fill="none"
                stroke={a.color}
                strokeWidth={isHover ? thickness + 4 : thickness}
                strokeLinecap="butt"
                style={{ cursor: onSliceClick ? 'pointer' : 'default', transition: 'stroke-width 0.15s' }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: 'easeOut' }}
                onMouseEnter={() => setHover(a.origIdx)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSliceClick?.(a.origIdx, { label: a.label, value: a.value })}
              />
            );
          })}
          {hoveredArc ? (
            <>
              <text x={c} y={c - 4} textAnchor="middle" fontSize="22" fontWeight="800" fill={hoveredArc.color} className="tabular-nums">
                {hoveredArc.value}
              </text>
              <text x={c} y={c + 14} textAnchor="middle" fontSize="10" fill="#64748b">{hoveredArc.label}</text>
              <text x={c} y={c + 28} textAnchor="middle" fontSize="9" fill="#94a3b8">{hoveredArc.pct.toFixed(1)}%</text>
            </>
          ) : (
            <>
              <text x={c} y={c - 2} textAnchor="middle" fontSize="20" fontWeight="800" fill={BRAND.primary}>{total}</text>
              <text x={c} y={c + 16} textAnchor="middle" fontSize="10" fill="#64748b">الإجمالي</text>
            </>
          )}
        </svg>
      </div>
      <ul className="space-y-1 text-sm">
        {data.map((d, i) => {
          const isHidden = hidden.has(i);
          const isHover = hover === i;
          return (
            <li
              key={i}
              onClick={() => toggle(i)}
              onMouseEnter={() => !isHidden && setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors',
                isHover && !isHidden ? 'bg-muted/60' : 'hover:bg-muted/40',
                isHidden && 'opacity-40',
              )}
              title={isHidden ? 'انقر للإظهار' : 'انقر للإخفاء'}
            >
              <span
                className={cn('w-3 h-3 rounded-full transition-transform', isHidden && 'ring-1 ring-current ring-offset-1')}
                style={{ background: isHidden ? 'transparent' : colors[i % colors.length], borderColor: colors[i % colors.length] }}
              />
              <span className={cn('text-foreground/80', isHidden && 'line-through')}>{d.label}</span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {d.value}{!isHidden && ` (${total ? ((d.value / total) * 100).toFixed(0) : 0}%)`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// =================== Stacked Bar ===================
export function StackedBar({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  if (total === 0) return <div className="text-center text-sm text-muted-foreground py-4">لا توجد بيانات</div>;
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        {segments.map((s, i) => (
          <div
            key={i}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
            className={cn('transition-all duration-200 cursor-pointer', hover === i && 'opacity-90 scale-y-150')}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-1.5 text-xs">
        {segments.map((s, i) => (
          <li
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={cn(
              'flex items-center gap-1.5 px-1.5 py-1 rounded cursor-default transition-colors',
              hover === i && 'bg-muted/60',
            )}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-foreground/80 truncate">{s.label}</span>
            <span className="text-muted-foreground ms-auto tabular-nums">
              {s.value} <span className="opacity-60">({((s.value / total) * 100).toFixed(0)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
