import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'mark' | 'light' | 'dark';
}

/**
 * Lotus Sharm logo — golden lotus inside a thin circle.
 * SVG re-creation so it scales crisp at any size.
 */
export function Logo({ className, size = 80, variant = 'full' }: LogoProps) {
  const isLight = variant === 'light' || variant === 'full';
  const labelColor = isLight ? '#ffffff' : '#0d3a3a';
  const subColor = isLight ? '#ffffff' : '#0d3a3a';

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)} style={{ width: size }}>
      <LogoMark size={size * 0.7} />
      {variant !== 'mark' && (
        <div className="text-center leading-none">
          <div
            className="heading-serif font-extrabold tracking-[0.15em]"
            style={{ color: labelColor, fontSize: size * 0.16, lineHeight: 1 }}
          >
            LOTUS
          </div>
          <div
            className="font-medium tracking-[0.3em] mt-0.5"
            style={{ color: subColor, fontSize: size * 0.07, lineHeight: 1, opacity: 0.92 }}
          >
            SHARM TRAVEL
          </div>
        </div>
      )}
    </div>
  );
}

export function LogoMark({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label="Lotus mark">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e7d1a1" />
          <stop offset="55%" stopColor="#c9a86a" />
          <stop offset="100%" stopColor="#7a6539" />
        </linearGradient>
        <linearGradient id="petalLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e7d1a1" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#c9a86a" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* arc / circle */}
      <path
        d="M 18 55 A 32 32 0 1 1 82 55"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* center petal */}
      <path
        d="M 50 28 C 56 36 60 46 60 56 C 60 64 55 70 50 70 C 45 70 40 64 40 56 C 40 46 44 36 50 28 Z"
        fill="url(#goldGrad)"
        opacity="0.95"
      />
      {/* left petal */}
      <path
        d="M 30 38 C 36 44 42 52 44 60 C 45 66 42 71 38 71 C 34 71 28 67 26 60 C 24 53 25 44 30 38 Z"
        fill="url(#petalLight)"
        opacity="0.85"
      />
      {/* right petal */}
      <path
        d="M 70 38 C 64 44 58 52 56 60 C 55 66 58 71 62 71 C 66 71 72 67 74 60 C 76 53 75 44 70 38 Z"
        fill="url(#petalLight)"
        opacity="0.85"
      />
      {/* outer left wing */}
      <path
        d="M 22 50 C 26 56 32 62 38 65 C 38 67 36 68 32 68 C 26 68 20 60 22 50 Z"
        fill="url(#goldGrad)"
        opacity="0.65"
      />
      {/* outer right wing */}
      <path
        d="M 78 50 C 74 56 68 62 62 65 C 62 67 64 68 68 68 C 74 68 80 60 78 50 Z"
        fill="url(#goldGrad)"
        opacity="0.65"
      />
    </svg>
  );
}
