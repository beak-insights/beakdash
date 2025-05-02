'use client';

import { create } from "zustand";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Create a simple Zustand store for toast state management
const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    
    // Set up auto-removal if duration is provided
    if (toast.duration) {
      setTimeout(() => {
        // Call onClose callback if provided
        if (toast.onClose) {
          toast.onClose();
        }
        
        // Remove the toast after duration
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration);
    }
    
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Export the hook for component usage
export function useToast() {
  return useToastStore();
}

// Export a standalone toast function for use outside of React components
export function toast(props: Omit<Toast, "id">) {
  return useToastStore.getState().addToast(props);
}