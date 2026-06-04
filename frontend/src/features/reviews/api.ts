import { api } from '../../lib/api';
import type {
  Review,
  ReviewListResponse,
  ReviewUpdatePayload,
} from './types';

export interface ListReviewsParams {
  search?: string;
  approved?: boolean;
  productId?: string;
  page?: number;
  pageSize?: number;
}

export const reviewsApi = {
  list: async (params: ListReviewsParams): Promise<ReviewListResponse> => {
    const res = await api.get<ReviewListResponse>('/reviews', {
      params: {
        ...params,
        approved: params.approved === undefined ? undefined : String(params.approved),
      },
    });
    return res.data;
  },
  listForProduct: async (productId: string): Promise<Review[]> => {
    const res = await api.get<Review[]>(`/products/${productId}/reviews`);
    return res.data;
  },
  update: async (id: string, payload: ReviewUpdatePayload): Promise<Review> => {
    const res = await api.patch<Review>(`/reviews/${id}`, payload);
    return res.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};
