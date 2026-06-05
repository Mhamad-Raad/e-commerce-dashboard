import { api } from '../../lib/api';
import type {
  FeeGroup,
  FeeGroupListResponse,
  FeeGroupWritePayload,
} from './types';

export interface ListFeeGroupsParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export const feeGroupsApi = {
  list: async (params: ListFeeGroupsParams = {}): Promise<FeeGroupListResponse> => {
    const res = await api.get<FeeGroupListResponse>('/fee-groups', {
      params: {
        ...params,
        isActive: params.isActive === undefined ? undefined : String(params.isActive),
      },
    });
    return res.data;
  },
  get: async (id: string): Promise<FeeGroup> => {
    const res = await api.get<FeeGroup>(`/fee-groups/${id}`);
    return res.data;
  },
  create: async (payload: FeeGroupWritePayload): Promise<FeeGroup> => {
    const res = await api.post<FeeGroup>('/fee-groups', payload);
    return res.data;
  },
  update: async (id: string, payload: Partial<FeeGroupWritePayload>): Promise<FeeGroup> => {
    const res = await api.patch<FeeGroup>(`/fee-groups/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/fee-groups/${id}`);
  },
};
