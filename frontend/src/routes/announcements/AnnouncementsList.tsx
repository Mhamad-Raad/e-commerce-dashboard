import { useState } from 'react';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { announcementsApi } from '@/features/announcements/api';
import type { Announcement } from '@/features/announcements/types';
import { AnnouncementForm } from './AnnouncementForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { UrlSearchInput } from '@/components/UrlSearchInput';
import { EmptyState } from '@/components/EmptyState';
import { TablePagination } from '@/components/TablePagination';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { useListParams } from '@/hooks/useListParams';
import { formatDate, extractErrorMessage } from '@/lib/format';

export function AnnouncementsList() {
  const { t } = useTranslation();
  const { page, limit, search, setPage, setLimit, setSearch } = useListParams({
    key: 'announcements',
  });
  const [composeOpen, setComposeOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['announcements', { search, page, limit }],
    queryFn: () => announcementsApi.list({ search: search || undefined, page, pageSize: limit }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success(t('announcements.deleted_toast'));
      setToDelete(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const columns: Column<Announcement>[] = [
    {
      key: 'title',
      header: t('announcements.title_field'),
      cell: (a) => <span className="font-medium">{a.titleEn}</span>,
    },
    {
      key: 'audience',
      header: t('announcements.audience'),
      cell: (a) =>
        a.audience === 'ALL' ? (
          <StatusBadge label={t('announcements.audience_all')} tone="green" />
        ) : (
          <span className="text-muted-foreground">
            {t('announcements.audience_specific_count', { count: a.recipientCount })}
          </span>
        ),
    },
    {
      key: 'recipients',
      header: t('announcements.recipients'),
      cell: (a) => a.recipientCount,
    },
    {
      key: 'sent',
      header: t('announcements.sent_at'),
      cell: (a) => <span className="text-muted-foreground">{formatDate(a.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (a) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => setToDelete(a)}
          aria-label={t('common.delete')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Megaphone}
        title={t('announcements.title')}
        description={t('announcements.subtitle')}
        action={
          <Button onClick={() => setComposeOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('announcements.new')}
          </Button>
        }
      />

      <UrlSearchInput
        value={search}
        onChange={setSearch}
        placeholder={t('announcements.search_placeholder')}
      />

      <DataTable
        columns={columns}
        rows={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(a) => a.id}
        emptyState={
          <EmptyState
            icon={Megaphone}
            title={t('announcements.empty_title')}
            description={t('announcements.empty_desc')}
            action={
              <Button size="sm" onClick={() => setComposeOpen(true)}>
                <Plus className="h-4 w-4" />
                {t('announcements.new')}
              </Button>
            }
          />
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

      <AnnouncementForm open={composeOpen} onOpenChange={setComposeOpen} />

      <ConfirmDialog
        open={!!toDelete}
        title={t('announcements.delete_title')}
        message={t('announcements.delete_message')}
        busy={deleteMutation.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
      />
    </div>
  );
}
