import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userService } from '../services/userService';
import type { User } from '../types/user';

interface UserState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  initialize: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token });
      },
      initialize: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) return;
        try {
          const me = await userService.getMe();
          set({ user: me, token });
        } catch {
          // token 无效或服务端错误时，清理登录态，避免前端误判为已登录
          localStorage.removeItem('token');
          set({ user: null, token: null });
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'user-storage',
    }
  )
);

