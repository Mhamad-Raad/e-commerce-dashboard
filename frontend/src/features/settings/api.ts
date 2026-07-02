import { api } from '../../lib/api';

export interface Settings {
  id: string;
  businessName: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessAddress: string | null;
  defaultCurrency: string;
  minAppVersion: string | null;
  latestAppVersion: string | null;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsWritePayload {
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  defaultCurrency?: string;
  // Version-gate fields: send '' to clear (the API stores it as null = off).
  minAppVersion?: string;
  latestAppVersion?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
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
