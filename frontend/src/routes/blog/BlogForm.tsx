import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { blogApi, type BlogWritePayload } from '@/features/blog/api';
import { PageHeader } from '@/components/PageHeader';
import { FormField } from '@/components/FormField';
import { ImageUpload } from '@/components/ImageUpload';
import { TranslatableInput } from '@/components/TranslatableInput';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage } from '@/lib/format';

const schema = z.object({
  titleEn: z.string().min(1).max(200),
  titleAr: z.string().max(200).optional().or(z.literal('')),
  titleCkb: z.string().max(200).optional().or(z.literal('')),
  excerptEn: z.string().max(500).optional().or(z.literal('')),
  excerptAr: z.string().max(500).optional().or(z.literal('')),
  excerptCkb: z.string().max(500).optional().or(z.literal('')),
  bodyEn: z.string().optional().or(z.literal('')),
  bodyAr: z.string().optional().or(z.literal('')),
  bodyCkb: z.string().optional().or(z.literal('')),
  coverImage: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  titleEn: '',
  titleAr: '',
  titleCkb: '',
  excerptEn: '',
  excerptAr: '',
  excerptCkb: '',
  bodyEn: '',
  bodyAr: '',
  bodyCkb: '',
  coverImage: '',
  isPublished: false,
};

export function BlogForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogApi.get(id!),
    enabled: isEdit,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (postQuery.data) {
      const p = postQuery.data;
      reset({
        titleEn: p.titleEn,
        titleAr: p.titleAr ?? '',
        titleCkb: p.titleCkb ?? '',
        excerptEn: p.excerptEn ?? '',
        excerptAr: p.excerptAr ?? '',
        excerptCkb: p.excerptCkb ?? '',
        bodyEn: p.bodyEn ?? '',
        bodyAr: p.bodyAr ?? '',
        bodyCkb: p.bodyCkb ?? '',
        coverImage: p.coverImage ?? '',
        isPublished: p.isPublished,
      });
    }
  }, [postQuery.data, reset]);

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const c = (v?: string) => v?.trim() || undefined;
      const payload: BlogWritePayload = {
        titleEn: values.titleEn.trim(),
        titleAr: c(values.titleAr),
        titleCkb: c(values.titleCkb),
        excerptEn: c(values.excerptEn),
        excerptAr: c(values.excerptAr),
        excerptCkb: c(values.excerptCkb),
        bodyEn: c(values.bodyEn),
        bodyAr: c(values.bodyAr),
        bodyCkb: c(values.bodyCkb),
        coverImage: c(values.coverImage),
        isPublished: values.isPublished,
      };
      return isEdit ? blogApi.update(id!, payload) : blogApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog'] });
      toast.success(t('blog.saved_toast'));
      navigate('/blog');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (isEdit && postQuery.isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }
  if (isEdit && postQuery.isError) {
    return <p className="text-destructive">{extractErrorMessage(postQuery.error)}</p>;
  }

  const tri = (base: 'title' | 'excerpt' | 'body') => ({
    en: watch(`${base}En`) ?? '',
    ar: watch(`${base}Ar`) ?? '',
    ckb: watch(`${base}Ckb`) ?? '',
  });
  const setTri = (base: 'title' | 'excerpt' | 'body') => (v: {
    en: string;
    ar: string;
    ckb: string;
  }) => {
    setValue(`${base}En`, v.en, { shouldDirty: true });
    setValue(`${base}Ar`, v.ar, { shouldDirty: true });
    setValue(`${base}Ckb`, v.ckb, { shouldDirty: true });
  };

  const isPublished = watch('isPublished');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/blog">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      </Button>

      <PageHeader icon={BookOpen} title={isEdit ? t('common.edit') : t('blog.new')} />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-5" noValidate>
            <TranslatableInput
              label={t('blog.title_col')}
              required
              value={tri('title')}
              onChange={setTri('title')}
              error={errors.titleEn?.message}
            />
            <FormField label={t('blog.cover')} error={errors.coverImage?.message}>
              <ImageUpload
                value={watch('coverImage') ?? ''}
                onChange={(url) => setValue('coverImage', url, { shouldDirty: true })}
                folder="homepage"
                aspect="wide"
              />
            </FormField>
            <TranslatableInput
              label={t('blog.excerpt')}
              multiline
              value={tri('excerpt')}
              onChange={setTri('excerpt')}
            />
            <TranslatableInput
              label={t('blog.body')}
              multiline
              value={tri('body')}
              onChange={setTri('body')}
            />

            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isPublished}
                onCheckedChange={(c) => setValue('isPublished', c === true)}
              />
              {t('blog.published')}
            </label>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/blog')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || save.isPending}>
                {save.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
