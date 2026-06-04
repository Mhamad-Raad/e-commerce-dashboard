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
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, extractErrorMessage } from '@/lib/format';
import { CustomerAddresses } from './CustomerAddresses';

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
            <CardTitle>{t('customers.contact')}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y pt-0">
            <DetailRow label={t('customers.email')}>{customer.email}</DetailRow>
            <DetailRow label={t('customers.phone')}>{customer.phone || t('common.none')}</DetailRow>
            <DetailRow label={t('common.status')}>
              <StatusBadge
                label={customer.isActive ? t('common.active') : t('common.inactive')}
                tone={customer.isActive ? 'green' : 'slate'}
              />
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
