import { api } from '../../lib/api';

/** Bucket folders the backend accepts — keep in sync with UPLOAD_FOLDERS on the server. */
export type UploadFolder =
  | 'products'
  | 'variants'
  | 'categories'
  | 'stores/logos'
  | 'stores/banners'
  | 'homepage';

export const uploadsApi = {
  /** Upload one image; returns the public R2 URL to store on the entity. */
  upload: async (file: File, folder: UploadFolder): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    // Don't set Content-Type — axios derives `multipart/form-data; boundary=…`
    // from the FormData. Setting it by hand drops the boundary and the server
    // can't parse the body.
    const res = await api.post<{ url: string }>('/uploads', form, {
      params: { folder },
    });
    return res.data.url;
  },
};
