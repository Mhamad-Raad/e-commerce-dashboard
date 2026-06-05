export type NotificationType = 'ORDER_CREATED' | 'REFUND_REQUESTED';

export interface AppNotification {
  id: string;
  type: NotificationType;
  meta: Record<string, unknown> | null;
  link: string | null;
  actorId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: AppNotification[];
  total: number;
  page: number;
  pageSize: number;
}
