import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  isAdmin: false,
  setIsAdmin: (isAdmin) => set({ isAdmin }),
}));
