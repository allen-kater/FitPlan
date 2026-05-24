import { create } from 'zustand';
import type { User } from '../types';
import * as authApi from '../api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('fitplan_token'),
  user: JSON.parse(localStorage.getItem('fitplan_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('fitplan_token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;
      localStorage.setItem('fitplan_token', token);
      localStorage.setItem('fitplan_user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true });
    try {
      const res = await authApi.register(username, email, password);
      const { token, user } = res.data;
      localStorage.setItem('fitplan_token', token);
      localStorage.setItem('fitplan_user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('fitplan_token');
    localStorage.removeItem('fitplan_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('fitplan_token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    try {
      const res = await authApi.getMe();
      const user = res.data;
      localStorage.setItem('fitplan_user', JSON.stringify(user));
      set({ token, user: user as User, isAuthenticated: true });
    } catch {
      localStorage.removeItem('fitplan_token');
      localStorage.removeItem('fitplan_user');
      set({ token: null, user: null, isAuthenticated: false });
    }
  },
}));
