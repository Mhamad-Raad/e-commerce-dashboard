interface Props {
  label: string;
  tone?: 'green' | 'amber' | 'slate' | 'blue' | 'red';
}

const toneClasses: Record<NonNullable<Props['tone']>, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-slate-100 text-slate-600',
  blue: 'bg-sky-50 text-sky-700',
  red: 'bg-red-50 text-red-700',
};

export function StatusBadge({ label, tone = 'slate' }: Props) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
