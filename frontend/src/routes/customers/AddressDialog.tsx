import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Address, AddressWritePayload } from '@/features/addresses/types';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GOVERNORATES, GOVERNORATE_CITIES, humanizeGeo } from '@/lib/iraqGeo';

const schema = z.object({
  label: z.string().max(60).optional().or(z.literal('')),
  governorate: z.string().min(1),
  city: z.string().min(1),
  district: z.string().max(120).optional().or(z.literal('')),
  street: z.string().max(200).optional().or(z.literal('')),
  nearestLandmark: z.string().max(200).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  isDefault: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface AddressDialogProps {
  open: boolean;
  address: Address | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: AddressWritePayload) => void;
}

export function AddressDialog({ open, address, saving, onOpenChange, onSubmit }: AddressDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!address;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '', governorate: '', city: '', district: '', street: '',
      nearestLandmark: '', phone: '', isDefault: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        label: address?.label ?? '',
        governorate: address?.governorate ?? '',
        city: address?.city ?? '',
        district: address?.district ?? '',
        street: address?.street ?? '',
        nearestLandmark: address?.nearestLandmark ?? '',
        phone: address?.phone ?? '',
        isDefault: address?.isDefault ?? false,
      });
    }
  }, [open, address, reset]);

  const governorate = watch('governorate');
  const city = watch('city');
  const isDefault = watch('isDefault');
  const cities = governorate ? GOVERNORATE_CITIES[governorate as keyof typeof GOVERNORATE_CITIES] ?? [] : [];

  const submit = (values: FormValues) => {
    onSubmit({
      label: values.label?.trim() || undefined,
      governorate: values.governorate,
      city: values.city,
      district: values.district?.trim() || undefined,
      street: values.street?.trim() || undefined,
      nearestLandmark: values.nearestLandmark?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      isDefault: values.isDefault,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('addresses.edit') : t('addresses.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <FormField label={t('addresses.label')} error={errors.label?.message}>
            <Input autoComplete="off" placeholder={t('addresses.label_placeholder')} {...register('label')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('addresses.governorate')} error={errors.governorate?.message}>
              <Select
                value={governorate || undefined}
                onValueChange={(v) => {
                  setValue('governorate', v, { shouldValidate: true });
                  setValue('city', '', { shouldValidate: true });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('addresses.select_governorate')} />
                </SelectTrigger>
                <SelectContent>
                  {GOVERNORATES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {humanizeGeo(g)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t('addresses.city')} error={errors.city?.message}>
              <Select
                value={city || undefined}
                onValueChange={(v) => setValue('city', v, { shouldValidate: true })}
                disabled={!governorate}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('addresses.select_city')} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {humanizeGeo(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('addresses.district')} error={errors.district?.message}>
              <Input autoComplete="off" {...register('district')} />
            </FormField>
            <FormField label={t('addresses.phone')} error={errors.phone?.message}>
              <Input autoComplete="off" inputMode="tel" {...register('phone')} />
            </FormField>
          </div>
          <FormField label={t('addresses.street')} error={errors.street?.message}>
            <Input autoComplete="off" {...register('street')} />
          </FormField>
          <FormField label={t('addresses.landmark')} error={errors.nearestLandmark?.message}>
            <Input autoComplete="off" placeholder={t('addresses.landmark_placeholder')} {...register('nearestLandmark')} />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isDefault} onCheckedChange={(c) => setValue('isDefault', c === true)} />
            {t('addresses.set_default')}
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
