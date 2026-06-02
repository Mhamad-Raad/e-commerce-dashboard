import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { BannerWritePayload, HeroBanner } from '@/features/homepage/types';
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

const schema = z.object({
  title: z.string().min(1).max(160),
  subtitle: z.string().max(300).optional().or(z.literal('')),
  imageUrl: z.string().url(),
  linkUrl: z.string().optional().or(z.literal('')),
  sortOrder: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface BannerDialogProps {
  open: boolean;
  banner: HeroBanner | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: BannerWritePayload) => void;
}

export function BannerDialog({ open, banner, saving, onOpenChange, onSubmit }: BannerDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!banner;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', subtitle: '', imageUrl: '', linkUrl: '', sortOrder: '0', isActive: true },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: banner?.title ?? '',
        subtitle: banner?.subtitle ?? '',
        imageUrl: banner?.imageUrl ?? '',
        linkUrl: banner?.linkUrl ?? '',
        sortOrder: String(banner?.sortOrder ?? 0),
        isActive: banner?.isActive ?? true,
      });
    }
  }, [open, banner, reset]);

  const submit = (values: FormValues) => {
    onSubmit({
      title: values.title.trim(),
      subtitle: values.subtitle?.trim() || undefined,
      imageUrl: values.imageUrl.trim(),
      linkUrl: values.linkUrl?.trim() || undefined,
      sortOrder: Number(values.sortOrder),
      isActive: values.isActive,
    });
  };

  const isActive = watch('isActive');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t('homepage.edit_banner') : t('homepage.new_banner')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <FormField label={t('homepage.banner_title')} error={errors.title?.message}>
            <Input autoComplete="off" {...register('title')} />
          </FormField>
          <FormField label={t('homepage.banner_subtitle')} error={errors.subtitle?.message}>
            <Input autoComplete="off" {...register('subtitle')} />
          </FormField>
          <FormField label={t('homepage.banner_image')} error={errors.imageUrl?.message}>
            <Input {...register('imageUrl')} placeholder="https://…" />
          </FormField>
          <FormField label={t('homepage.banner_link')} error={errors.linkUrl?.message}>
            <Input {...register('linkUrl')} placeholder="/category/…" />
          </FormField>
          <FormField label={t('homepage.banner_order')} error={errors.sortOrder?.message}>
            <Input inputMode="numeric" {...register('sortOrder')} />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isActive} onCheckedChange={(c) => setValue('isActive', c === true)} />
            {t('common.active')}
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
