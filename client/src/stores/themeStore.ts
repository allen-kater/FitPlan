import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  effectiveMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getEffectiveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

/** 同步 document.documentElement 的 dark class */
function syncDarkClass(effectiveMode: 'light' | 'dark') {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', effectiveMode === 'dark');
  }
}

const savedMode = (localStorage.getItem('fitplan_theme') as ThemeMode) || 'system';
const initialEffectiveMode = getEffectiveMode(savedMode);

// 初始化时同步 dark class
syncDarkClass(initialEffectiveMode);

export const useThemeStore = create<ThemeState>((set) => ({
  mode: savedMode,
  effectiveMode: initialEffectiveMode,
  setMode: (mode) => {
    localStorage.setItem('fitplan_theme', mode);
    const effectiveMode = getEffectiveMode(mode);
    syncDarkClass(effectiveMode);
    set({ mode, effectiveMode });
  },
  toggleMode: () => {
    set((state) => {
      const next = state.effectiveMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('fitplan_theme', next);
      syncDarkClass(next);
      return { mode: next, effectiveMode: next };
    });
  },
}));

// 监听系统主题变化
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.mode === 'system') {
      const effectiveMode = getSystemTheme();
      syncDarkClass(effectiveMode);
      useThemeStore.setState({ effectiveMode });
    }
  });
}
