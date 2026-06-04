import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check, EyeOff, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { reviewsApi } from '@/features/reviews/api';
import type { Review } from '@/features/reviews/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { UrlSearchInput } from '@/components/UrlSearchInput';
import { EmptyState } from '@/components/EmptyState';
import { TablePagination } from '@/components/TablePagination';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListParams } from '@/hooks/useListParams';
import { formatDate, extractErrorMessage } from '@/lib/format';

type Filter = 'all' | 'pending' | 'approved';

export function ReviewsList() {
  const { t } = useTranslation();
  const { page, limit, search, setPage, setLimit, setSearch } = useListParams({ key: 'reviews' });
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('pending');
  const [toDelete, setToDelete] = useState<Review | null>(null);

  const approved = filter === 'all' ? undefined : filter === 'approved';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reviews', { search, page, limit, filter }],
    queryFn: () =>
      reviewsApi.list({ search: search || undefined, approved, page, pageSize: limit }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const setApproval = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      reviewsApi.update(id, { isApproved }),
    onSuccess: () => {
      invalidate();
      toast.success(t('reviews.updated_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      invalidate();
      setToDelete(null);
      toast.success(t('reviews.deleted_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setPage(1);
  };

  const columns: Column<Review>[] = [
    {
      key: 'product',
      header: t('reviews.product'),
      cell: (r) =>
        r.product ? (
          <Link
            to={`/products/${r.product.id}`}
            className="font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {r.product.name}
          </Link>
        ) : (
          '—'
        ),
    },
    { key: 'customer', header: t('reviews.customer'), cell: (r) => r.customer?.name ?? '—' },
    { key: 'rating', header: t('reviews.rating'), cell: (r) => <Stars value={r.rating} size={13} /> },
    {
      key: 'comment',
      header: t('reviews.comment'),
      cell: (r) => (
        <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
          {r.comment || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (r) => (
        <StatusBadge
          label={r.isApproved ? t('reviews.approved') : t('reviews.pending')}
          tone={r.isApproved ? 'green' : 'amber'}
        />
      ),
    },
    {
      key: 'created',
      header: t('common.created'),
      cell: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={r.isApproved ? t('reviews.hide') : t('reviews.approve')}
            onClick={() => setApproval.mutate({ id: r.id, isApproved: !r.isApproved })}
          >
            {r.isApproved ? <EyeOff className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-600" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title={t('common.delete')}
            onClick={() => setToDelete(r)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Star}
        title={t('reviews.title')}
        description={data ? t('reviews.total_count', { count: data.total }) : undefined}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filter} onValueChange={(v) => changeFilter(v as Filter)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">{t('reviews.filter_pending')}</SelectItem>
            <SelectItem value="approved">{t('reviews.filter_approved')}</SelectItem>
            <SelectItem value="all">{t('reviews.filter_all')}</SelectItem>
          </SelectContent>
        </Select>
        <div className="min-w-48 flex-1">
          <UrlSearchInput value={search} onChange={setSearch} placeholder={t('reviews.search_placeholder')} />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(r) => r.id}
        emptyState={
          <EmptyState icon={Star} title={t('reviews.empty_title')} description={t('reviews.empty_desc')} />
        }
      />

      {data && data.total > 0 && (
        <TablePagination
          page={page}
          pageSize={limit}
          total={data.total}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={t('reviews.delete_title')}
        message={t('reviews.delete_message')}
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
