import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { blogApi, type BlogListItem } from '@/features/blog/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DataTable, type Column } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { RowActions } from '@/components/RowActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { extractErrorMessage, formatDate } from '@/lib/format';

export function BlogList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [toDelete, setToDelete] = useState<BlogListItem | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['blog'],
    queryFn: blogApi.listAdmin,
  });

  const remove = useMutation({
    mutationFn: (id: string) => blogApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] });
      toast.success(t('blog.deleted_toast'));
      setToDelete(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const columns: Column<BlogListItem>[] = [
    {
      key: 'cover',
      header: '',
      className: 'w-14',
      cell: (b) => (
        <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
          {b.coverImage && (
            <img src={b.coverImage} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      ),
    },
    { key: 'title', header: t('blog.title_col'), cell: (b) => b.titleEn },
    {
      key: 'status',
      header: t('common.status'),
      cell: (b) => (
        <Badge variant={b.isPublished ? 'default' : 'outline'}>
          {b.isPublished ? t('blog.published') : t('blog.draft')}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: t('common.created'),
      cell: (b) => formatDate(b.createdAt),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (b) => (
        <RowActions editTo={`/blog/${b.id}/edit`} onDelete={() => setToDelete(b)} />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BookOpen}
        title={t('blog.title')}
        action={
          <Button asChild>
            <Link to="/blog/new">
              <Plus className="h-4 w-4" />
              {t('blog.new')}
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        rowKey={(b) => b.id}
        emptyState={
          <EmptyState
            icon={BookOpen}
            title={t('blog.empty_title')}
            description={t('blog.empty_desc')}
          />
        }
      />

      <ConfirmDialog
        open={!!toDelete}
        title={t('blog.delete_title')}
        message={toDelete ? t('blog.delete_message', { title: toDelete.titleEn }) : ''}
        busy={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  );
}
