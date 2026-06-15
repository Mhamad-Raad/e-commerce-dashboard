import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Tags, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { categoriesApi } from '@/features/categories/api';
import type { AttributeType, CategoryWritePayload } from '@/features/categories/types';
import { PageHeader } from '@/components/PageHeader';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage } from '@/lib/format';

const ATTR_TYPES: AttributeType[] = ['text', 'textarea', 'number', 'select', 'multiselect'];
const needsOptions = (t: AttributeType) => t === 'select' || t === 'multiselect';

// Stable machine key derived from a label, e.g. "Skin type" -> "skin_type".
const toKey = (label: string) =>
  label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

const attrRow = z
  .object({
    key: z.string(),
    label: z.string().min(1, 'Required'),
    type: z.enum(['text', 'textarea', 'number', 'select', 'multiselect']),
    optionsText: z.string(),
  })
  .refine((r) => !needsOptions(r.type) || r.optionsText.trim().length > 0, {
    message: 'Add at least one option',
    path: ['optionsText'],
  });

const schema = z
  .object({
    name: z.string().min(1).max(60),
    imageUrl: z.string().url().optional().or(z.literal('')),
    description: z.string().max(1000).optional().or(z.literal('')),
    isActive: z.boolean(),
    attributeSchema: z.array(attrRow),
  })
  // Derived attribute keys must be present and unique (they key product values).
  .superRefine((vals, ctx) => {
    const seen = new Set<string>();
    vals.attributeSchema.forEach((row, i) => {
      const key = row.key.trim() || toKey(row.label);
      if (!key) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Label must include letters or numbers',
          path: ['attributeSchema', i, 'label'],
        });
        return;
      }
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate attribute',
          path: ['attributeSchema', i, 'label'],
        });
      }
      seen.add(key);
    });
  });

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: '',
  imageUrl: '',
  description: '',
  isActive: true,
  attributeSchema: [],
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
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'attributeSchema' });

  useEffect(() => {
    if (categoryQuery.data) {
      const c = categoryQuery.data;
      reset({
        name: c.name,
        imageUrl: c.imageUrl ?? '',
        description: c.description ?? '',
        isActive: c.isActive,
        attributeSchema: (c.attributeSchema ?? []).map((a) => ({
          key: a.key,
          label: a.label,
          type: a.type,
          optionsText: (a.options ?? []).join(', '),
        })),
      });
    }
  }, [categoryQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: CategoryWritePayload = {
        name: values.name.trim(),
        imageUrl: values.imageUrl?.trim() || null,
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
        attributeSchema: values.attributeSchema.map((row) => ({
          key: row.key.trim() || toKey(row.label),
          label: row.label.trim(),
          type: row.type,
          ...(needsOptions(row.type)
            ? {
                options: row.optionsText
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              }
            : {}),
        })),
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

      <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5" noValidate>
        <Card>
          <CardContent className="space-y-5 pt-6">
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
              <Checkbox checked={isActive} onCheckedChange={(c) => setValue('isActive', c === true)} />
              {t('common.active')}
            </label>
          </CardContent>
        </Card>

        {/* Category-driven product attributes */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-sm font-medium">{t('categories.attributes')}</p>
              <p className="text-xs text-muted-foreground">{t('categories.attributes_hint')}</p>
            </div>

            {fields.map((field, i) => {
              const type = watch(`attributeSchema.${i}.type`);
              return (
                <div key={field.id} className="space-y-3 rounded-lg border p-3">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <FormField
                        label={t('categories.attr_label')}
                        error={errors.attributeSchema?.[i]?.label?.message}
                      >
                        <Input {...register(`attributeSchema.${i}.label`)} />
                      </FormField>
                    </div>
                    <div className="w-44">
                      <FormField label={t('categories.attr_type')}>
                        <Select
                          value={type}
                          onValueChange={(v) =>
                            setValue(`attributeSchema.${i}.type`, v as AttributeType, {
                              shouldDirty: true,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTR_TYPES.map((at) => (
                              <SelectItem key={at} value={at}>
                                {t(`categories.attr_type_${at}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mb-0.5 shrink-0 text-muted-foreground"
                      onClick={() => remove(i)}
                      aria-label={t('categories.attr_remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {needsOptions(type) && (
                    <FormField
                      label={t('categories.attr_options')}
                      hint={t('categories.attr_options_hint')}
                      error={errors.attributeSchema?.[i]?.optionsText?.message}
                    >
                      <Input
                        placeholder="oily, dry, combination, sensitive"
                        {...register(`attributeSchema.${i}.optionsText`)}
                      />
                    </FormField>
                  )}
                  <input type="hidden" {...register(`attributeSchema.${i}.key`)} />
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ key: '', label: '', type: 'text', optionsText: '' })}
            >
              <Plus className="h-4 w-4" />
              {t('categories.add_attribute')}
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/categories')}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
            {saveMutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
