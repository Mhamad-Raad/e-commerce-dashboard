import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { homeLayoutApi } from '@/features/home-layout/api';
import type {
  PublicItem,
  PublicSection,
} from '@/features/home-layout/types';
import { formatMoney } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';

// The app's berry brand color — the preview mirrors the mobile look.
const BERRY = '#ba0048';

/** Live, phone-width preview of the resolved layout in the current language. */
export function HomePreview() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'en';
  const dir = lang === 'ar' || lang === 'ckb' ? 'rtl' : 'ltr';

  const { data, isLoading } = useQuery({
    queryKey: ['home-preview', lang],
    queryFn: () => homeLayoutApi.getPublic(lang),
  });

  return (
    <div className="sticky top-4">
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        {t('home_builder.preview')}
      </p>
      <div
        dir={dir}
        className="mx-auto w-full max-w-[390px] space-y-5 overflow-hidden rounded-2xl border bg-background py-4 shadow-sm"
      >
        {isLoading ? (
          <div className="space-y-4 px-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {t('home_builder.empty')}
          </p>
        ) : (
          data.map((section) => <PreviewSection key={section.id} section={section} />)
        )}
      </div>
    </div>
  );
}

function PreviewSection({ section }: { section: PublicSection }) {
  if (section.items.length === 0) return null;
  switch (section.type) {
    case 'BANNER':
      return <Banner section={section} />;
    case 'CATEGORIES':
      return <Circles section={section} pick={(i) => i.category} />;
    case 'BRANDS':
      return <Circles section={section} pick={(i) => i.store} />;
    case 'PRODUCTS':
      return <Products section={section} />;
    case 'BLOG':
      return <Blog section={section} />;
    default:
      return null;
  }
}

function Heading({ title }: { title: string | null }) {
  if (!title) return null;
  return <p className="px-4 pb-2 text-base font-semibold">{title}</p>;
}

function Banner({ section }: { section: PublicSection }) {
  const item = section.items[0];
  return (
    <div className="px-4">
      <div className="relative h-32 overflow-hidden rounded-xl bg-muted">
        {item.imageUrl && (
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {item.badge && (
          <span
            className="absolute start-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase text-white"
            style={{ backgroundColor: BERRY }}
          >
            {item.badge}
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3">
          {item.label && (
            <p className="text-sm font-bold leading-tight text-white">{item.label}</p>
          )}
          {item.ctaLabel && (
            <span
              className="mt-1 inline-block rounded-full px-3 py-1 text-[11px] font-medium text-white"
              style={{ backgroundColor: BERRY }}
            >
              {item.ctaLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Circles({
  section,
  pick,
}: {
  section: PublicSection;
  pick: (item: PublicItem) => { name: string; imageUrl?: string | null; logoUrl?: string | null } | undefined;
}) {
  return (
    <div>
      <Heading title={section.title} />
      <div className="flex gap-3 overflow-x-auto px-4">
        {section.items.map((item) => {
          const e = pick(item);
          if (!e) return null;
          const img = e.imageUrl ?? e.logoUrl ?? null;
          return (
            <div key={item.id} className="w-16 shrink-0 text-center">
              <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-muted">
                {img && <img src={img} alt="" className="h-full w-full object-cover" />}
              </div>
              <p className="mt-1 truncate text-[11px]">{e.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Products({ section }: { section: PublicSection }) {
  return (
    <div>
      <Heading title={section.title} />
      <div className="grid grid-cols-2 gap-3 px-4">
        {section.items.map((item) => {
          const p = item.product;
          if (!p) return null;
          return (
            <div key={item.id} className="overflow-hidden rounded-xl border">
              <div className="aspect-square bg-muted">
                {p.imageUrl && (
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="space-y-0.5 p-2">
                {p.storeName && (
                  <p className="truncate text-[10px] italic" style={{ color: BERRY }}>
                    {p.storeName}
                  </p>
                )}
                <p className="truncate text-xs">{p.name}</p>
                <p className="text-xs font-bold" style={{ color: BERRY }}>
                  {formatMoney(p.salePriceCents ?? p.priceCents, p.currency)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Blog({ section }: { section: PublicSection }) {
  return (
    <div>
      <Heading title={section.title} />
      <div className="flex gap-3 overflow-x-auto px-4">
        {section.items.map((item) => {
          const b = item.blogPost;
          if (!b) return null;
          return (
            <div key={item.id} className="w-52 shrink-0 overflow-hidden rounded-xl border">
              <div className="aspect-video bg-muted">
                {b.coverImage && (
                  <img src={b.coverImage} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-bold">{b.title}</p>
                {b.excerpt && (
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">{b.excerpt}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
