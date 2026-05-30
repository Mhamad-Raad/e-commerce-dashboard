import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { cartsApi } from '@/features/carts/api';
import { customersApi } from '@/features/customers/api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage } from '@/lib/format';

export function NewCart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');

  const customersQuery = useQuery({
    queryKey: ['customers', 'picker'],
    queryFn: () => customersApi.list({ pageSize: 100, isActive: true }),
  });

  const createMutation = useMutation({
    mutationFn: () => cartsApi.create({ customerId }),
    onSuccess: (cart) => navigate(`/carts/${cart.id}`),
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  return (
    <div className="mx-auto max-w-md space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/carts">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader icon={ShoppingCart} title={t('carts.new')} />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1.5">
            <Label>{t('carts.customer')}</Label>
            <Select value={customerId || undefined} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder={`${t('carts.customer')}…`} />
              </SelectTrigger>
              <SelectContent>
                {customersQuery.data?.items.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/carts')}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={!customerId || createMutation.isPending}
            >
              {createMutation.isPending ? t('common.working') : t('common.create')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
