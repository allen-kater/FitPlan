import { create } from 'zustand';

interface UIState {
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  };
  globalLoading: boolean;
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
  hideSnackbar: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  globalLoading: false,

  showSnackbar: (message, severity = 'info') => {
    set({ snackbar: { open: true, message, severity } });
  },

  hideSnackbar: () => {
    set((state) => ({ snackbar: { ...state.snackbar, open: false } }));
  },

  setGlobalLoading: (loading) => {
    set({ globalLoading: loading });
  },
}));
