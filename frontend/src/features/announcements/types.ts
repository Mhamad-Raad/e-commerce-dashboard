import type { HomeTargetType } from '@/features/home-layout/types';

export type AnnouncementAudience = 'ALL' | 'SINGLE';

export interface Announcement {
  id: string;
  titleEn: string;
  titleAr: string | null;
  titleCkb: string | null;
  bodyEn: string;
  bodyAr: string | null;
  bodyCkb: string | null;
  imageUrl: string | null;
  targetType: HomeTargetType;
  targetId: string | null;
  url: string | null;
  audience: AnnouncementAudience;
  recipientCount: number;
  createdAt: string;
}

export interface AnnouncementListResponse {
  items: Announcement[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAnnouncementPayload {
  titleEn: string;
  titleAr?: string;
  titleCkb?: string;
  bodyEn: string;
  bodyAr?: string;
  bodyCkb?: string;
  imageUrl?: string;
  targetType: HomeTargetType;
  targetId?: string;
  url?: string;
  audience: AnnouncementAudience;
  customerIds?: string[];
}
