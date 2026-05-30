import { type ReactNode } from 'react';

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

/** A label/value row for detail-page definition lists. */
export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-medium">{children}</span>
    </div>
  );
}
