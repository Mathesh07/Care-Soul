import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

export interface NotificationItem {
  _id?: string;
  id?: string;
  isRead?: boolean;
  createdAt?: string;
  [key: string]: unknown;
}

interface NotificationStore {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadMyNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

function countUnread(list: NotificationItem[]): number {
  return list.reduce((acc, item) => acc + (item.isRead ? 0 : 1), 0);
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  loadMyNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await notificationService.getMyNotifications();
      const list = (response?.notifications || response?.data || []) as NotificationItem[];
      set({ notifications: list, unreadCount: countUnread(list), loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load notifications';
      set({ loading: false, error: message });
    }
  },

  markRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      const notifications = get().notifications.map((item) => {
        if (item._id === id || item.id === id) {
          return { ...item, isRead: true };
        }
        return item;
      });
      set({ notifications, unreadCount: countUnread(notifications) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
      set({ error: message });
    }
  },

  markAllRead: async () => {
    try {
      await notificationService.markAllAsRead();
      const notifications = get().notifications.map((item) => ({ ...item, isRead: true }));
      set({ notifications, unreadCount: 0 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to mark notifications as read';
      set({ error: message });
    }
  },
}));
