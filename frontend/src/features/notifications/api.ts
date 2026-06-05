import { api } from '../../lib/api';
import type { AppNotification, NotificationListResponse } from './types';

export const notificationsApi = {
  list: async (params: { unreadOnly?: boolean; page?: number; pageSize?: number } = {}): Promise<NotificationListResponse> => {
    const res = await api.get<NotificationListResponse>('/notifications', {
      params: {
        ...params,
        unreadOnly: params.unreadOnly === undefined ? undefined : String(params.unreadOnly),
      },
    });
    return res.data;
  },
  unreadCount: async (): Promise<{ count: number }> => {
    const res = await api.get<{ count: number }>('/notifications/unread-count');
    return res.data;
  },
  markRead: async (id: string): Promise<AppNotification> => {
    const res = await api.patch<AppNotification>(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },
};
