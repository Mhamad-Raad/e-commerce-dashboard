import { api } from '../../lib/api';

export interface Settings {
  id: string;
  businessName: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessAddress: string | null;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsWritePayload {
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  defaultCurrency?: string;
}

export const settingsApi = {
  get: async (): Promise<Settings> => {
    const res = await api.get<Settings>('/settings');
    return res.data;
  },
  update: async (payload: SettingsWritePayload): Promise<Settings> => {
    const res = await api.patch<Settings>('/settings', payload);
    return res.data;
  },
};
