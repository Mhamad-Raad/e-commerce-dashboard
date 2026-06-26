import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { customersApi } from '@/features/customers/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export interface Recipient {
  id: string;
  name: string;
}

interface RecipientPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (recipient: Recipient) => void;
}

/** Search + pick a single customer to send a direct notification to. */
export function RecipientPicker({ open, onOpenChange, onPick }: RecipientPickerProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['recipient-picker', debounced],
    queryFn: () => customersApi.list({ search: debounced || undefined, pageSize: 20 }),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('announcements.pick_recipient')}</DialogTitle>
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
          {!isLoading && data?.items.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('common.no_results')}
            </p>
          )}
          {data?.items.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onPick({ id: c.id, name: c.name });
                onOpenChange(false);
              }}
              className="flex w-full flex-col items-start rounded-md p-2 text-start hover:bg-muted"
            >
              <span className="truncate text-sm font-medium">{c.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {c.phone ?? c.email}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
