import { create } from 'zustand';

export type AuthTab = 'login' | 'register';

interface AuthModalState {
  visible: boolean;
  defaultTab: AuthTab;
  openModal: (tab?: AuthTab) => void;
  closeModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  visible: false,
  defaultTab: 'login',
  openModal: (tab = 'login') => set({ visible: true, defaultTab: tab }),
  closeModal: () => set((state) => ({ visible: false, defaultTab: state.defaultTab })),
}));


