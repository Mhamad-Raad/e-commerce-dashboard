import { api } from '../../lib/api';

export interface BlogListItem {
  id: string;
  titleEn: string;
  titleAr: string | null;
  titleCkb: string | null;
  excerptEn: string | null;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface BlogPost extends BlogListItem {
  bodyEn: string | null;
  bodyAr: string | null;
  bodyCkb: string | null;
  excerptAr: string | null;
  excerptCkb: string | null;
}

export interface BlogWritePayload {
  titleEn: string;
  titleAr?: string;
  titleCkb?: string;
  excerptEn?: string;
  excerptAr?: string;
  excerptCkb?: string;
  bodyEn?: string;
  bodyAr?: string;
  bodyCkb?: string;
  coverImage?: string;
  isPublished?: boolean;
}

export const blogApi = {
  listAdmin: async (): Promise<BlogListItem[]> => {
    const res = await api.get<BlogListItem[]>('/blog/admin');
    return res.data;
  },
  get: async (id: string): Promise<BlogPost> => {
    const res = await api.get<BlogPost>(`/blog/admin/${id}`);
    return res.data;
  },
  create: async (payload: BlogWritePayload): Promise<BlogPost> => {
    const res = await api.post<BlogPost>('/blog', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<BlogWritePayload>): Promise<BlogPost> => {
    const res = await api.patch<BlogPost>(`/blog/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/blog/${id}`);
  },
};
