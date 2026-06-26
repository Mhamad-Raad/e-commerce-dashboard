import { api } from '../../lib/api';
import type {
  Announcement,
  AnnouncementListResponse,
  CreateAnnouncementPayload,
} from './types';

export interface ListAnnouncementsParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export const announcementsApi = {
  list: async (params: ListAnnouncementsParams): Promise<AnnouncementListResponse> => {
    const res = await api.get<AnnouncementListResponse>('/announcements', { params });
    return res.data;
  },
  // Compose + send immediately. Returns the created announcement.
  create: async (payload: CreateAnnouncementPayload): Promise<Announcement> => {
    const res = await api.post<Announcement>('/announcements', payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/announcements/${id}`);
  },
};
