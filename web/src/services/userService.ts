import { api } from './apiClient';
import type { User } from '../types/user';
import { resolveAsset } from '../utils/url';

export const userService = {
  async getMe(): Promise<User> {
    const { data } = await api.get('/v1/users/me');
    return normalizeUser(data);
  },
  async updateMe(payload: Partial<Pick<User, 'nickname' | 'campus' | 'avatar' | 'coverImage'>> & { phone?: string }): Promise<User> {
    const { data } = await api.put('/v1/users/me', payload);
    return normalizeUser(data);
  },
};

function normalizeUser(raw: User & { avatar?: string | null; coverImage?: string | null }) {
  return {
    ...raw,
    avatar: resolveAsset(raw?.avatar),
    coverImage: resolveAsset((raw as any).coverImage),
  } as User;
}


