import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { ProductImage } from '@/features/products/ProductImage';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface PickerOption {
  id: string;
  label: string;
  imageUrl?: string | null;
}

interface FeaturedPickerProps {
  title: string;
  description?: string;
  options: PickerOption[];
  value: string[];
  saving: boolean;
  onSave: (ids: string[]) => void;
}

const sameOrder = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

/** Pick, order (up/down) and remove a set of entities, then persist the order. */
export function FeaturedPicker({
  title,
  description,
  options,
  value,
  saving,
  onSave,
}: FeaturedPickerProps) {
  const { t } = useTranslation();
  const [ids, setIds] = useState<string[]>(value);

  // Re-sync when the server value changes (e.g. after a successful save/refetch).
  useEffect(() => setIds(value), [value]);

  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const available = options.filter((o) => !ids.includes(o.id));
  const dirty = !sameOrder(ids, value);

  const move = (index: number, delta: number) => {
    const next = [...ids];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setIds(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value=""
          onValueChange={(id) => id && setIds((prev) => [...prev, id])}
          disabled={available.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('homepage.add_item')} />
          </SelectTrigger>
          <SelectContent>
            {available.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {ids.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t('homepage.none_selected')}
          </p>
        ) : (
          <ul className="space-y-2">
            {ids.map((id, index) => {
              const opt = byId.get(id);
              if (!opt) return null;
              return (
                <li
                  key={id}
                  className="flex items-center gap-3 rounded-md border bg-card px-3 py-2"
                >
                  <span className="w-5 text-center text-xs text-muted-foreground">{index + 1}</span>
                  <ProductImage src={opt.imageUrl ?? null} alt={opt.label} className="h-8 w-8 rounded" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{opt.label}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={t('homepage.move_up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={index === ids.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label={t('homepage.move_down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setIds((prev) => prev.filter((x) => x !== id))}
                      aria-label={t('common.delete')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex justify-end gap-2">
          {dirty && (
            <Button type="button" variant="outline" onClick={() => setIds(value)} disabled={saving}>
              {t('common.cancel')}
            </Button>
          )}
          <Button type="button" onClick={() => onSave(ids)} disabled={!dirty || saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
