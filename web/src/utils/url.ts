import { ASSET_BASE_URL } from '../services/apiClient';

export function resolveAsset(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/uploads')) return `${ASSET_BASE_URL}${url}`;
  return url;
}


