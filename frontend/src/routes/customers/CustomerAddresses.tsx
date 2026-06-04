import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { addressesApi } from '@/features/addresses/api';
import type { Address, AddressWritePayload } from '@/features/addresses/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { extractErrorMessage } from '@/lib/format';
import { humanizeGeo } from '@/lib/iraqGeo';
import { AddressDialog } from './AddressDialog';

const MAX_ADDRESSES = 3;

export function CustomerAddresses({ customerId }: { customerId: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses', customerId],
    queryFn: () => addressesApi.list(customerId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['addresses', customerId] });
    queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: AddressWritePayload) =>
      editing
        ? addressesApi.update(customerId, editing.id, payload)
        : addressesApi.create(customerId, payload),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast.success(t('addresses.saved_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (address: Address) => addressesApi.remove(customerId, address.id),
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success(t('addresses.deleted_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (address: Address) => {
    setEditing(address);
    setDialogOpen(true);
  };

  const atLimit = addresses.length >= MAX_ADDRESSES;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {t('addresses.title')}
          <span className="text-sm font-normal text-muted-foreground">
            ({addresses.length}/{MAX_ADDRESSES})
          </span>
        </CardTitle>
        <Button size="sm" onClick={openNew} disabled={atLimit} title={atLimit ? t('addresses.limit') : undefined}>
          <Plus className="h-4 w-4" />
          {t('addresses.add')}
        </Button>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('addresses.empty')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((a) => (
              <div key={a.id} className="relative rounded-lg border p-3 text-sm">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-medium">{a.label || t('addresses.address')}</span>
                  {a.isDefault && (
                    <StatusBadge label={t('addresses.default')} tone="green" />
                  )}
                </div>
                <p className="text-muted-foreground">
                  {humanizeGeo(a.city)}, {humanizeGeo(a.governorate)}
                </p>
                {(a.district || a.street) && (
                  <p className="text-muted-foreground">
                    {[a.district, a.street].filter(Boolean).join(' · ')}
                  </p>
                )}
                {a.nearestLandmark && (
                  <p className="text-xs text-muted-foreground">{a.nearestLandmark}</p>
                )}
                {a.phone && <p className="mt-1 font-mono text-xs">{a.phone}</p>}
                <div className="mt-2 flex justify-end gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(a)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleting(a)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AddressDialog
        open={dialogOpen}
        address={editing}
        saving={saveMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      <ConfirmDialog
        open={!!deleting}
        title={t('addresses.delete_title')}
        message={t('addresses.delete_message')}
        busy={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting)}
      />
    </Card>
  );
}
