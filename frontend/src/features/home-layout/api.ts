import { api } from '../../lib/api';
import type {
  AdminSection,
  CreateSectionPayload,
  PublicSection,
  UpdateSectionPayload,
} from './types';

export const homeLayoutApi = {
  list: async (): Promise<AdminSection[]> => {
    const res = await api.get<AdminSection[]>('/home/sections');
    return res.data;
  },
  // Resolved layout for the live preview (same payload the app gets).
  getPublic: async (lang: string): Promise<PublicSection[]> => {
    const res = await api.get<PublicSection[]>('/home/layout', { params: { lang } });
    return res.data;
  },
  create: async (payload: CreateSectionPayload): Promise<AdminSection> => {
    const res = await api.post<AdminSection>('/home/sections', payload);
    return res.data;
  },
  update: async (id: string, payload: UpdateSectionPayload): Promise<AdminSection> => {
    const res = await api.patch<AdminSection>(`/home/sections/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/home/sections/${id}`);
  },
  reorder: async (sections: { id: string; position: number }[]): Promise<void> => {
    await api.patch('/home/sections/reorder', { sections });
  },
};
