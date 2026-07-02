import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { customersApi } from '@/features/customers/api';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailRow } from '@/components/DetailRow';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PriceLabel } from '@/components/PriceLabel';
import { ProductImage } from '@/features/products/ProductImage';
import { formatDate, formatMoney, extractErrorMessage, initials } from '@/lib/format';
import { CustomerAddresses } from './CustomerAddresses';
import { CustomerConversations } from './CustomerConversations';

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: customer, isLoading, isError, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.get(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => customersApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(t('customers.deleted_toast'));
      navigate('/customers');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const assistantToggle = useMutation({
    mutationFn: (assistantEnabled: boolean) =>
      customersApi.update(id!, { assistantEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      toast.success(t('customers.ai_toggle_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/customers">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
        <p className="text-destructive">{extractErrorMessage(error)}</p>
      </div>
    );
  }

  const cartItems = (customer.carts ?? []).flatMap((c) => c.items);
  const favorites = customer.favorites ?? [];

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/customers">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader
        icon={Users}
        title={customer.name}
        description={customer.email}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/customers/${customer.id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t('common.edit')}
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t('common.delete')}
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                {customer.avatarUrl && <AvatarImage src={customer.avatarUrl} alt="" />}
                <AvatarFallback>{initials(customer.name)}</AvatarFallback>
              </Avatar>
              <CardTitle>{t('customers.contact')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            <DetailRow label={t('customers.email')}>{customer.email}</DetailRow>
            <DetailRow label={t('customers.gender')}>
              {customer.gender ? t(`customers.${customer.gender.toLowerCase()}`) : t('common.none')}
            </DetailRow>
            <DetailRow label={t('customers.phone')}>{customer.phone || t('common.none')}</DetailRow>
            <DetailRow label={t('common.status')}>
              <StatusBadge
                label={customer.isActive ? t('common.active') : t('common.inactive')}
                tone={customer.isActive ? 'green' : 'slate'}
              />
            </DetailRow>
            <DetailRow label={t('customers.ai_assistant')}>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={customer.assistantEnabled}
                  disabled={assistantToggle.isPending}
                  onCheckedChange={(c) => assistantToggle.mutate(c === true)}
                />
                <span className="text-muted-foreground">
                  {customer.assistantEnabled ? t('common.enabled') : t('common.disabled')}
                </span>
              </label>
            </DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('customers.address')}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            <DetailRow label={t('customers.address')}>
              {customer.address || t('common.none')}
            </DetailRow>
            <DetailRow label={t('customers.city')}>{customer.city || t('common.none')}</DetailRow>
            <DetailRow label={t('customers.country')}>
              {customer.country || t('common.none')}
            </DetailRow>
            <DetailRow label={t('customers.joined')}>{formatDate(customer.createdAt)}</DetailRow>
          </CardContent>
        </Card>
      </div>

      <CustomerAddresses customerId={customer.id} />

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('customers.cart')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {cartItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('customers.cart_empty')}</p>
            ) : (
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <ProductImage
                      src={item.product?.imageUrl ?? null}
                      alt={item.product?.name ?? ''}
                      className="h-10 w-10 shrink-0 rounded-md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.product?.name ?? t('common.none')}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">×{item.quantity}</span>
                    <span className="text-sm font-medium">
                      {formatMoney(item.priceCents * item.quantity, item.product?.currency ?? 'IQD')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('customers.favorites')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('customers.favorites_empty')}</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {favorites.map((fav) => (
                  <div key={fav.id} className="flex items-center gap-2 rounded-lg border p-2">
                    <ProductImage
                      src={fav.product?.imageUrl ?? null}
                      alt={fav.product?.name ?? ''}
                      className="h-10 w-10 shrink-0 rounded-md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {fav.product?.name ?? t('common.none')}
                      </p>
                      {fav.product && (
                        <PriceLabel
                          priceCents={fav.product.priceCents}
                          currency={fav.product.currency}
                          className="text-xs text-muted-foreground"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerConversations customerId={customer.id} />

      <ConfirmDialog
        open={confirmOpen}
        title={t('customers.delete_title')}
        message={t('customers.delete_message', { name: customer.name })}
        busy={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}
