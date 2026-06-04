import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarsProps {
  value: number;
  count?: number;
  size?: number;
  className?: string;
}

/** Read-only 5-star rating display (supports half-star fill via clipping). */
export function Stars({ value, count, size = 14, className }: StarsProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star className="absolute text-muted-foreground/40" style={{ width: size, height: size }} />
              <span className="absolute overflow-hidden" style={{ width: `${fill * 100}%`, height: size }}>
                <Star
                  className="text-amber-500"
                  style={{ width: size, height: size }}
                  fill="currentColor"
                />
              </span>
            </span>
          );
        })}
      </span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">
          {value ? value.toFixed(1) : '—'}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </span>
  );
}
