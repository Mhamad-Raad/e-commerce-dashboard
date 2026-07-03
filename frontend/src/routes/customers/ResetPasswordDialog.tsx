import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Factory so validation messages resolve in the active locale.
const makeSchema = (t: TFunction) =>
  z
    .object({
      password: z.string().min(8, t('validation.password_min_8')),
      confirmPassword: z.string(),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: t('validation.passwords_no_match'),
      path: ['confirmPassword'],
    });

type FormValues = z.infer<ReturnType<typeof makeSchema>>;

interface Props {
  open: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => void;
}

export function ResetPasswordDialog({ open, saving, onOpenChange, onSubmit }: Props) {
  const { t } = useTranslation();

  // Rebuilt on language change so messages re-resolve in the new locale.
  const schema = useMemo(() => makeSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (open) reset({ password: '', confirmPassword: '' });
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('customers.reset_password')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => onSubmit(v.password))} className="space-y-4" noValidate>
          <p className="text-sm text-muted-foreground">{t('customers.reset_password_desc')}</p>
          <FormField label={t('customers.new_password')} error={errors.password?.message}>
            <Input type="password" autoComplete="new-password" {...register('password')} />
          </FormField>
          <FormField label={t('customers.confirm_password')} error={errors.confirmPassword?.message}>
            <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('customers.reset_password')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
