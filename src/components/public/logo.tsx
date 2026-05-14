import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'mark' | 'light' | 'dark';
}

/**
 * Lotus Sharm logo — uses the official client-provided artwork served from
 * /logo.jpg (uploaded to public_html). Full lockup with golden lotus +
 * "LOTUS SHARM TRAVEL" wordmark on dark teal background.
 */
export function Logo({ className, size = 80 }: LogoProps) {
  return (
    <div
      className={cn('inline-block rounded-xl overflow-hidden ring-1 ring-accent/40 shadow-md shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.jpg"
        alt="Lotus Sharm Travel"
        width={size * 2}
        height={size * 2}
        priority
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export function LogoMark({ size = 56 }: { size?: number }) {
  return <Logo size={size} />;
}
