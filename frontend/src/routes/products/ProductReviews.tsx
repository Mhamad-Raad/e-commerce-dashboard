import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check, EyeOff, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { reviewsApi } from '@/features/reviews/api';
import type { Review } from '@/features/reviews/types';
import type { Product } from '@/features/products/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, extractErrorMessage } from '@/lib/format';

export function ProductReviews({ product }: { product: Product }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<Review | null>(null);

  const { data: reviews = [] } = useQuery({
    queryKey: ['product-reviews', product.id],
    queryFn: () => reviewsApi.listForProduct(product.id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['product-reviews', product.id] });
    queryClient.invalidateQueries({ queryKey: ['product', product.id] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
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
    mutationFn: (review: Review) => reviewsApi.remove(review.id),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success(t('reviews.deleted_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {t('reviews.title')}
        </CardTitle>
        <Stars value={product.ratingAvg} count={product.ratingCount} size={16} />
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('reviews.empty_product')}</p>
        ) : (
          <ul className="divide-y">
            {reviews.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={r.rating} size={13} />
                    <span className="text-sm font-medium">{r.customer?.name ?? '—'}</span>
                    <StatusBadge
                      label={r.isApproved ? t('reviews.approved') : t('reviews.pending')}
                      tone={r.isApproved ? 'green' : 'amber'}
                    />
                    <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.title && <p className="text-sm font-medium">{r.title}</p>}
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title={r.isApproved ? t('reviews.hide') : t('reviews.approve')}
                    onClick={() => setApproval.mutate({ id: r.id, isApproved: !r.isApproved })}
                  >
                    {r.isApproved ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4 text-emerald-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    title={t('common.delete')}
                    onClick={() => setDeleting(r)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!deleting}
        title={t('reviews.delete_title')}
        message={t('reviews.delete_message')}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting)}
      />
    </Card>
  );
}
