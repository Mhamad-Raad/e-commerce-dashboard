export type HomeSectionType = 'BANNER' | 'BLOG' | 'BRANDS' | 'CATEGORIES' | 'PRODUCTS';
export type HomeTargetType = 'NONE' | 'PRODUCT' | 'CATEGORY' | 'STORE' | 'BLOG' | 'URL';

export const SECTION_TYPES: HomeSectionType[] = [
  'BANNER',
  'CATEGORIES',
  'PRODUCTS',
  'BRANDS',
  'BLOG',
];

/** English display ref for the picker UI (admin shape). */
export interface TargetRef {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface AdminSectionItem {
  id: string;
  position: number;
  imageUrl: string | null;
  label: string | null;
  labelAr: string | null;
  labelCkb: string | null;
  subtitle: string | null;
  subtitleAr: string | null;
  subtitleCkb: string | null;
  badge: string | null;
  badgeAr: string | null;
  badgeCkb: string | null;
  ctaLabel: string | null;
  ctaLabelAr: string | null;
  ctaLabelCkb: string | null;
  targetType: HomeTargetType;
  url?: string;
  productId: string | null;
  categoryId: string | null;
  storeId: string | null;
  blogPostId: string | null;
  product?: TargetRef;
  category?: TargetRef;
  store?: TargetRef;
  blogPost?: TargetRef;
}

export interface AdminSection {
  id: string;
  type: HomeSectionType;
  position: number;
  isActive: boolean;
  titleEn: string | null;
  titleAr: string | null;
  titleCkb: string | null;
  config: { layout?: string } & Record<string, unknown>;
  items: AdminSectionItem[];
}

// ── Write payloads ────────────────────────────────────────────────────────────
export interface ItemPayload {
  position?: number;
  imageUrl?: string;
  label?: string;
  labelAr?: string;
  labelCkb?: string;
  subtitle?: string;
  subtitleAr?: string;
  subtitleCkb?: string;
  badge?: string;
  badgeAr?: string;
  badgeCkb?: string;
  ctaLabel?: string;
  ctaLabelAr?: string;
  ctaLabelCkb?: string;
  targetType: HomeTargetType;
  productId?: string;
  categoryId?: string;
  storeId?: string;
  blogPostId?: string;
  url?: string;
}

export interface CreateSectionPayload {
  type: HomeSectionType;
  isActive?: boolean;
  titleEn?: string;
  titleAr?: string;
  titleCkb?: string;
  config?: Record<string, unknown>;
  items?: ItemPayload[];
}

export type UpdateSectionPayload = Omit<CreateSectionPayload, 'type'>;

// ── Public (resolved) shape — what the mobile app receives; used by the preview ─
export interface PublicProduct {
  id: string;
  name: string;
  priceCents: number;
  salePriceCents: number | null;
  currency: string;
  imageUrl: string | null;
  storeName: string | null;
}
export interface PublicCategory {
  id: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
}
export interface PublicStore {
  id: string;
  name: string;
  logoUrl: string | null;
  productCount: number;
}
export interface PublicBlog {
  id: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
}
export interface PublicItem {
  id: string;
  imageUrl: string | null;
  label: string | null;
  subtitle: string | null;
  badge: string | null;
  ctaLabel: string | null;
  targetType: HomeTargetType;
  url?: string;
  product?: PublicProduct;
  category?: PublicCategory;
  store?: PublicStore;
  blogPost?: PublicBlog;
}
export interface PublicSection {
  id: string;
  type: HomeSectionType;
  title: string | null;
  config: { layout?: string } & Record<string, unknown>;
  items: PublicItem[];
}

/** The default target type for each section kind (BANNER is user-chosen). */
export const DEFAULT_TARGET: Record<HomeSectionType, HomeTargetType> = {
  BANNER: 'URL',
  BLOG: 'BLOG',
  BRANDS: 'STORE',
  CATEGORIES: 'CATEGORY',
  PRODUCTS: 'PRODUCT',
};
