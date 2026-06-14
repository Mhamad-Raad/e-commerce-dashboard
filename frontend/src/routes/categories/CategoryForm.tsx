import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { categoriesApi } from '@/features/categories/api';
import type { CategoryWritePayload } from '@/features/categories/types';
import { PageHeader } from '@/components/PageHeader';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage } from '@/lib/format';

const schema = z.object({
  name: z.string().min(1).max(60),
  imageUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  imageUrl: '',
  description: '',
  isActive: true,
};

export function CategoryForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const categoryQuery = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesApi.get(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (categoryQuery.data) {
      const c = categoryQuery.data;
      reset({
        name: c.name,
        imageUrl: c.imageUrl ?? '',
        description: c.description ?? '',
        isActive: c.isActive,
      });
    }
  }, [categoryQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: CategoryWritePayload = {
        name: values.name.trim(),
        imageUrl: values.imageUrl?.trim() || undefined,
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
      };
      return isEdit ? categoriesApi.update(id!, payload) : categoriesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['category', id] });
      toast.success(t('categories.saved_toast'));
      navigate('/categories');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (isEdit && categoryQuery.isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }
  if (isEdit && categoryQuery.isError) {
    return <p className="text-destructive">{extractErrorMessage(categoryQuery.error)}</p>;
  }

  const isActive = watch('isActive');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/categories">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader icon={Tags} title={isEdit ? t('common.edit') : t('categories.new')} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5" noValidate>
            <FormField label={t('categories.name')} error={errors.name?.message}>
              <Input autoComplete="off" {...register('name')} />
            </FormField>
            <FormField label={t('categories.image')} error={errors.imageUrl?.message}>
              <ImageUpload
                value={watch('imageUrl') ?? ''}
                onChange={(url) => setValue('imageUrl', url, { shouldDirty: true })}
                folder="categories"
              />
            </FormField>
            <FormField label={t('categories.description')} error={errors.description?.message}>
              <Textarea rows={3} {...register('description')} />
            </FormField>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isActive}
                onCheckedChange={(c) => setValue('isActive', c === true)}
              />
              {t('common.active')}
            </label>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/categories')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
                {saveMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
