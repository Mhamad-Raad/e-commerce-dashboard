import { cn } from '@/lib/utils';

interface Props {
  label: string;
  tone?: 'green' | 'amber' | 'slate' | 'blue' | 'red';
}

const toneClasses: Record<NonNullable<Props['tone']>, string> = {
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  slate: 'bg-muted text-muted-foreground',
  blue: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  red: 'bg-red-500/15 text-red-600 dark:text-red-400',
};

export function StatusBadge({ label, tone = 'slate' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  );
}
