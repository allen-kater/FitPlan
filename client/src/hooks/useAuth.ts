import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const { user, isAuthenticated, loading, login, register, logout, checkAuth } = useAuthStore();

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
    isAdmin: user?.role === 'ADMIN',
  };
}
