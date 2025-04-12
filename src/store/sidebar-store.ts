import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (value: boolean) => set({ collapsed: value }),
    }),
    {
      name: 'sidebar-storage', // Local storage key
    }
  )
);