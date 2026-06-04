import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PriceLabelProps {
  priceCents: number;
  salePriceCents?: number | null;
  currency: string;
  className?: string;
}

/** Shows the sale price with the original struck through when on sale. */
export function PriceLabel({ priceCents, salePriceCents, currency, className }: PriceLabelProps) {
  const onSale = salePriceCents != null && salePriceCents < priceCents;
  if (!onSale) {
    return <span className={className}>{formatMoney(priceCents, currency)}</span>;
  }
  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      <span className="font-medium text-emerald-600 dark:text-emerald-400">
        {formatMoney(salePriceCents!, currency)}
      </span>
      <span className="text-xs text-muted-foreground line-through">
        {formatMoney(priceCents, currency)}
      </span>
    </span>
  );
}
