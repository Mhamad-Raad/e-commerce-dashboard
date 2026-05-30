import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { customersApi } from '@/features/customers/api';
import type { Customer } from '@/features/customers/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { SearchInput } from '@/components/SearchInput';
import { EmptyState } from '@/components/EmptyState';
import { Pagination } from '@/components/Pagination';
import { RowActions } from '@/components/RowActions';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, extractErrorMessage } from '@/lib/format';

const PAGE_SIZE = 20;

export function CustomersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customers', { search, page }],
    queryFn: () => customersApi.list({ search: search || undefined, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(t('customers.deleted_toast'));
      setToDelete(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: t('customers.name'),
      cell: (c) => <span className="font-medium">{c.name}</span>,
    },
    { key: 'email', header: t('customers.email'), cell: (c) => c.email },
    {
      key: 'phone',
      header: t('customers.phone'),
      cell: (c) => c.phone ?? t('common.none'),
    },
    {
      key: 'city',
      header: t('customers.city'),
      cell: (c) => c.city ?? t('common.none'),
    },
    {
      key: 'status',
      header: t('common.status'),
      cell: (c) => (
        <StatusBadge
          label={c.isActive ? t('common.active') : t('common.inactive')}
          tone={c.isActive ? 'green' : 'slate'}
        />
      ),
    },
    {
      key: 'joined',
      header: t('customers.joined'),
      cell: (c) => <span className="text-muted-foreground">{formatDate(c.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (c) => <RowActions editTo={`/customers/${c.id}/edit`} onDelete={() => setToDelete(c)} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Users}
        title={t('customers.title')}
        description={data ? t('customers.total_count', { count: data.total }) : undefined}
        action={
          <Button asChild>
            <Link to="/customers/new">
              <Plus className="h-4 w-4" />
              {t('customers.new')}
            </Link>
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder={t('customers.search_placeholder')}
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(c) => c.id}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
        emptyState={
          <EmptyState
            icon={Users}
            title={t('customers.empty_title')}
            description={t('customers.empty_desc')}
            action={
              <Button asChild size="sm">
                <Link to="/customers/new">
                  <Plus className="h-4 w-4" />
                  {t('customers.new')}
                </Link>
              </Button>
            }
          />
        }
      />

      {data && totalPages > 1 && (
        <Pagination page={data.page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={t('customers.delete_title')}
        message={toDelete ? t('customers.delete_message', { name: toDelete.name }) : ''}
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
