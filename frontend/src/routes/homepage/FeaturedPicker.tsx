import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { AsyncCombobox, type AsyncPage } from '@/components/AsyncCombobox';
import { ProductImage } from '@/features/products/ProductImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface PickerOption {
  id: string;
  label: string;
  imageUrl?: string | null;
}

interface FeaturedPickerProps {
  title: string;
  description?: string;
  /** Currently-featured items (full objects, in server order). */
  selectedItems: PickerOption[];
  /** Stable base key for the entity, e.g. ['products']. */
  queryKey: unknown[];
  fetchPage: (search: string, page: number) => Promise<AsyncPage<PickerOption>>;
  saving: boolean;
  onSave: (ids: string[]) => void;
}

const sameOrder = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

/** Pick (async search), order (up/down) and remove a set of entities, then persist. */
export function FeaturedPicker({
  title,
  description,
  selectedItems,
  queryKey,
  fetchPage,
  saving,
  onSave,
}: FeaturedPickerProps) {
  const { t } = useTranslation();
  const serverIds = useMemo(() => selectedItems.map((s) => s.id), [selectedItems]);
  const [ids, setIds] = useState<string[]>(serverIds);
  const [itemMap, setItemMap] = useState<Map<string, PickerOption>>(
    () => new Map(selectedItems.map((s) => [s.id, s])),
  );

  // Re-sync when the server set changes (after a save/refetch).
  useEffect(() => {
    setIds(serverIds);
    setItemMap((prev) => {
      const next = new Map(prev);
      selectedItems.forEach((s) => next.set(s.id, s));
      return next;
    });
  }, [serverIds, selectedItems]);

  const dirty = !sameOrder(ids, serverIds);

  const move = (index: number, delta: number) => {
    const next = [...ids];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setIds(next);
  };

  const add = (item: PickerOption | null) => {
    if (!item || ids.includes(item.id)) return;
    setItemMap((prev) => new Map(prev).set(item.id, item));
    setIds((prev) => [...prev, item.id]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <AsyncCombobox<PickerOption>
          value=""
          onChange={(_, item) => add(item)}
          placeholder={t('homepage.add_item')}
          queryKey={queryKey}
          fetchPage={fetchPage}
          getItemId={(o) => o.id}
          getItemLabel={(o) => o.label}
          excludeIds={ids}
        />

        {ids.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {t('homepage.none_selected')}
          </p>
        ) : (
          <ul className="space-y-2">
            {ids.map((id, index) => {
              const opt = itemMap.get(id);
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
            <Button type="button" variant="outline" onClick={() => setIds(serverIds)} disabled={saving}>
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
