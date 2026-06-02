import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';

export interface AsyncPage<T> {
  items: T[];
  total: number;
}

interface AsyncComboboxProps<T> {
  value: string;
  onChange: (id: string, item: T | null) => void;
  /** Label to show on the trigger when an item is selected but not in the loaded pages (e.g. on edit). */
  selectedLabel?: string;
  placeholder?: string;
  /** Stable base key identifying the entity, e.g. ['products']. Search term is appended internally. */
  queryKey: unknown[];
  fetchPage: (search: string, page: number) => Promise<AsyncPage<T>>;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  renderItem?: (item: T) => ReactNode;
  /** Ids to hide from results (already-picked elsewhere). */
  excludeIds?: string[];
  pageSize?: number;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

/**
 * Async autocomplete: debounced server-side search with infinite-scroll results.
 * Mirrors the akkooo dashboard's autocomplete; TanStack `useInfiniteQuery` supplies
 * the request dedup / stale-cancellation that akkooo handled with a request-id guard.
 */
export function AsyncCombobox<T>({
  value,
  onChange,
  selectedLabel,
  placeholder,
  queryKey,
  fetchPage,
  getItemId,
  getItemLabel,
  renderItem,
  excludeIds = [],
  pageSize = 20,
  disabled,
  allowClear,
  className,
}: AsyncComboboxProps<T>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [localLabel, setLocalLabel] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [...queryKey, 'combobox', debouncedSearch, pageSize],
      queryFn: ({ pageParam }) => fetchPage(debouncedSearch, pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
        return loaded < lastPage.total ? allPages.length + 1 : undefined;
      },
      enabled: open,
    });

  const items = (data?.pages.flatMap((p) => p.items) ?? []).filter(
    (it) => !excludeIds.includes(getItemId(it)),
  );

  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      if (!node) return;
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observer.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const select = (item: T) => {
    setLocalLabel(getItemLabel(item));
    onChange(getItemId(item), item);
    setOpen(false);
    setSearch('');
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalLabel(undefined);
    onChange('', null);
  };

  const displayLabel = value ? localLabel ?? selectedLabel ?? value : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', !value && 'text-muted-foreground', className)}
        >
          <span className="truncate">{displayLabel || placeholder || t('combobox.search')}</span>
          <span className="flex items-center gap-1">
            {allowClear && value && (
              <X
                className="h-4 w-4 shrink-0 opacity-60 hover:opacity-100"
                onClick={clear}
                aria-label={t('common.delete')}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('combobox.search')}
            className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('combobox.loading')}
            </div>
          ) : items.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t('combobox.no_results')}
            </div>
          ) : (
            <>
              {items.map((item) => {
                const id = getItemId(item);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => select(item)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-start text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Check className={cn('h-4 w-4 shrink-0', id === value ? 'opacity-100' : 'opacity-0')} />
                    <span className="min-w-0 flex-1 truncate">
                      {renderItem ? renderItem(item) : getItemLabel(item)}
                    </span>
                  </button>
                );
              })}
              <div ref={sentinelRef} />
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
        {isFetching && !isLoading && !isFetchingNextPage && (
          <div className="border-t px-3 py-1 text-end text-xs text-muted-foreground">
            {t('combobox.loading')}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
