import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { categoriesApi } from '@/features/categories/api';
import { productsApi } from '@/features/products/api';
import { storesApi } from '@/features/stores/api';
import { blogApi } from '@/features/blog/api';
import type { HomeTargetType, TargetRef } from '@/features/home-layout/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

type PickerKind = Extract<HomeTargetType, 'PRODUCT' | 'CATEGORY' | 'STORE' | 'BLOG'>;

interface EntityPickerProps {
  kind: PickerKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (ref: TargetRef) => void;
}

async function fetchEntities(kind: PickerKind, search: string): Promise<TargetRef[]> {
  const s = search || undefined;
  switch (kind) {
    case 'PRODUCT': {
      const r = await productsApi.list({ search: s, pageSize: 20 });
      return r.items.map((p) => ({ id: p.id, name: p.name, imageUrl: p.imageUrl }));
    }
    case 'CATEGORY': {
      const r = await categoriesApi.list({ search: s, pageSize: 20 });
      return r.items.map((c) => ({ id: c.id, name: c.name, imageUrl: c.imageUrl }));
    }
    case 'STORE': {
      const r = await storesApi.list({ search: s, pageSize: 20 });
      return r.items.map((st) => ({ id: st.id, name: st.name, imageUrl: st.logoUrl }));
    }
    case 'BLOG': {
      const all = await blogApi.listAdmin();
      const q = (search || '').toLowerCase();
      return all
        .filter((b) => !q || b.titleEn.toLowerCase().includes(q))
        .map((b) => ({ id: b.id, name: b.titleEn, imageUrl: b.coverImage }));
    }
  }
}

/** Search + pick a single product / category / store / blog post. */
export function EntityPicker({ kind, open, onOpenChange, onPick }: EntityPickerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['entity-picker', kind, debounced],
    queryFn: () => fetchEntities(kind, debounced),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t(`home_builder.pick_${kind.toLowerCase()}`)}</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
        />
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          {!isLoading && data?.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('common.no_results')}
            </p>
          )}
          {data?.map((ref) => (
            <button
              key={ref.id}
              type="button"
              onClick={() => {
                onPick(ref);
                onOpenChange(false);
              }}
              className="flex w-full items-center gap-3 rounded-md p-2 text-start hover:bg-muted"
            >
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
                {ref.imageUrl && (
                  <img src={ref.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <span className="truncate text-sm">{ref.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
