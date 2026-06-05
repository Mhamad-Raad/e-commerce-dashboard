import { api } from './api';

/** Fetch a file (with auth) and trigger a browser download. */
export async function downloadFile(
  path: string,
  params: Record<string, unknown>,
  filename: string,
): Promise<void> {
  const res = await api.get(path, { params, responseType: 'blob' });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
