'use client';

import { createContext, useContext } from 'react';

import type {
  ToastActionElement,
  ToastProps,
} from '@/components/ui/toast';

const TOAST_REMOVE_DELAY = 3000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastContextType = {
  toasts: ToasterToast[];
  addToast: (toast: Omit<ToasterToast, 'id'>) => string;
  updateToast: (id: string, toast: Partial<ToasterToast>) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    const addToast = ({ ...props }: Omit<ToasterToast, 'id'>) => {
      console.warn('Tried to add toast without ToastProvider');
      return '-1';
    }

    const updateToast = (id: string, { ...props }: Partial<ToasterToast>) => {
      console.warn('Tried to update toast without ToastProvider');
    }

    const dismissToast = (id: string) => {
      console.warn('Tried to dismiss toast without ToastProvider');
    }

    return {
      toasts: [],
      addToast,
      updateToast,
      dismissToast,
      toast: (props: Omit<ToasterToast, 'id'>) => addToast(props),
    }
  }

  const { toasts, addToast, updateToast, dismissToast } = context;

  return {
    toasts,
    addToast,
    updateToast,
    dismissToast,
    toast: (props: Omit<ToasterToast, 'id'>) => addToast(props),
  }
}

export { ToastContext };
export type { ToasterToast, ToastContextType };