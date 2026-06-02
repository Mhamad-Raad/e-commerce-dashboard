import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LayoutTemplate, Plus, Pencil, Trash2, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { homepageApi } from '@/features/homepage/api';
import type { BannerWritePayload, HeroBanner } from '@/features/homepage/types';
import { productsApi } from '@/features/products/api';
import { categoriesApi } from '@/features/categories/api';
import { storesApi } from '@/features/stores/api';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage } from '@/lib/format';
import { BannerDialog } from './BannerDialog';
import { FeaturedPicker } from './FeaturedPicker';

export function Homepage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<HeroBanner | null>(null);

  const homepageQuery = useQuery({ queryKey: ['homepage'], queryFn: homepageApi.get });

  const invalidateHomepage = () => queryClient.invalidateQueries({ queryKey: ['homepage'] });

  const saveBanner = useMutation({
    mutationFn: (payload: BannerWritePayload) =>
      editingBanner
        ? homepageApi.updateBanner(editingBanner.id, payload)
        : homepageApi.createBanner(payload),
    onSuccess: () => {
      invalidateHomepage();
      toast.success(t('homepage.banner_saved_toast'));
      setBannerDialogOpen(false);
      setEditingBanner(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteBanner = useMutation({
    mutationFn: (id: string) => homepageApi.removeBanner(id),
    onSuccess: () => {
      invalidateHomepage();
      toast.success(t('homepage.banner_deleted_toast'));
      setBannerToDelete(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const featuredMutation = useMutation({
    mutationFn: async ({ kind, ids }: { kind: 'products' | 'categories' | 'stores'; ids: string[] }) => {
      if (kind === 'products') {
        await homepageApi.setFeaturedProducts(ids);
      } else if (kind === 'categories') {
        await homepageApi.setFeaturedCategories(ids);
      } else {
        await homepageApi.setFeaturedStores(ids);
      }
    },
    onSuccess: () => {
      invalidateHomepage();
      toast.success(t('homepage.featured_saved_toast'));
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const openNewBanner = () => {
    setEditingBanner(null);
    setBannerDialogOpen(true);
  };
  const openEditBanner = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setBannerDialogOpen(true);
  };

  const home = homepageQuery.data;
  const savingKind = featuredMutation.isPending
    ? (featuredMutation.variables?.kind as string | undefined)
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutTemplate}
        title={t('homepage.title')}
        description={t('homepage.subtitle')}
      />

      {/* Hero banners */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t('homepage.banners')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('homepage.banners_desc')}</p>
          </div>
          <Button size="sm" onClick={openNewBanner}>
            <Plus className="h-4 w-4" />
            {t('homepage.new_banner')}
          </Button>
        </CardHeader>
        <CardContent>
          {homepageQuery.isLoading ? (
            <Skeleton className="h-32 w-full rounded-lg" />
          ) : !home || home.banners.length === 0 ? (
            <EmptyState
              icon={ImageOff}
              title={t('homepage.no_banners_title')}
              description={t('homepage.no_banners_desc')}
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {home.banners.map((b) => (
                <li key={b.id} className="overflow-hidden rounded-lg border bg-card">
                  <div className="relative h-28 w-full bg-muted">
                    <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
                    <div className="absolute end-2 top-2">
                      <StatusBadge
                        label={b.isActive ? t('common.active') : t('common.hidden')}
                        tone={b.isActive ? 'green' : 'slate'}
                      />
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{b.title}</p>
                      {b.subtitle && (
                        <p className="truncate text-xs text-muted-foreground">{b.subtitle}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditBanner(b)}
                        aria-label={t('common.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setBannerToDelete(b)}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Featured sets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FeaturedPicker
          title={t('homepage.featured_products')}
          description={t('homepage.featured_products_desc')}
          selectedItems={(home?.featuredProducts ?? []).map((p) => ({
            id: p.id,
            label: p.name,
            imageUrl: p.imageUrl,
          }))}
          queryKey={['products']}
          fetchPage={(search, page) =>
            productsApi.list({ search: search || undefined, page, pageSize: 20 }).then((r) => ({
              items: r.items.map((p) => ({ id: p.id, label: p.name, imageUrl: p.imageUrl })),
              total: r.total,
            }))
          }
          saving={savingKind === 'products'}
          onSave={(ids) => featuredMutation.mutate({ kind: 'products', ids })}
        />
        <FeaturedPicker
          title={t('homepage.featured_categories')}
          description={t('homepage.featured_categories_desc')}
          selectedItems={(home?.featuredCategories ?? []).map((c) => ({
            id: c.id,
            label: c.name,
            imageUrl: c.imageUrl,
          }))}
          queryKey={['categories']}
          fetchPage={(search, page) =>
            categoriesApi.list({ search: search || undefined, page, pageSize: 20 }).then((r) => ({
              items: r.items.map((c) => ({ id: c.id, label: c.name, imageUrl: c.imageUrl })),
              total: r.total,
            }))
          }
          saving={savingKind === 'categories'}
          onSave={(ids) => featuredMutation.mutate({ kind: 'categories', ids })}
        />
        <FeaturedPicker
          title={t('homepage.featured_stores')}
          description={t('homepage.featured_stores_desc')}
          selectedItems={(home?.featuredStores ?? []).map((s) => ({
            id: s.id,
            label: s.name,
            imageUrl: s.logoUrl,
          }))}
          queryKey={['stores']}
          fetchPage={(search, page) =>
            storesApi.list({ search: search || undefined, page, pageSize: 20 }).then((r) => ({
              items: r.items.map((s) => ({ id: s.id, label: s.name, imageUrl: s.logoUrl })),
              total: r.total,
            }))
          }
          saving={savingKind === 'stores'}
          onSave={(ids) => featuredMutation.mutate({ kind: 'stores', ids })}
        />
      </div>

      <BannerDialog
        open={bannerDialogOpen}
        banner={editingBanner}
        saving={saveBanner.isPending}
        onOpenChange={(open) => {
          setBannerDialogOpen(open);
          if (!open) setEditingBanner(null);
        }}
        onSubmit={(payload) => saveBanner.mutate(payload)}
      />

      <ConfirmDialog
        open={!!bannerToDelete}
        title={t('homepage.delete_banner_title')}
        message={bannerToDelete ? t('homepage.delete_banner_message', { title: bannerToDelete.title }) : ''}
        busy={deleteBanner.isPending}
        onCancel={() => setBannerToDelete(null)}
        onConfirm={() => bannerToDelete && deleteBanner.mutate(bannerToDelete.id)}
      />
    </div>
  );
}
