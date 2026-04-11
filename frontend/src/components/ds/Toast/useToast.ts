// frontend/src/components/ds/Toast/useToast.ts
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number; // Duration in ms
}

interface ToastStore {
  toasts: ToastConfig[];
  addToast: (toast: Omit<ToastConfig, 'id'>) => string;
  removeToast: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = generateId();
    set((state) => ({
      // Stack new toasts at the beginning (index 0 is newest)
      toasts: [{ ...toast, id }, ...state.toasts].slice(0, 5)
    }));
    return id;
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  }))
}));

export const useToast = () => {
  const store = useToastStore();
  
  return {
    success: (title: string, opts?: Partial<ToastConfig>) => store.addToast({ type: 'success', title, duration: 4000, ...opts }),
    error: (title: string, opts?: Partial<ToastConfig>) => store.addToast({ type: 'error', title, duration: 6000, ...opts }),
    warning: (title: string, opts?: Partial<ToastConfig>) => store.addToast({ type: 'warning', title, duration: 5000, ...opts }),
    info: (title: string, opts?: Partial<ToastConfig>) => store.addToast({ type: 'info', title, duration: 4000, ...opts }),
    loading: (title: string, opts?: Partial<ToastConfig>) => store.addToast({ type: 'loading', title, duration: 999999, ...opts }),
    dismiss: (id: string) => store.removeToast(id)
  };
};
