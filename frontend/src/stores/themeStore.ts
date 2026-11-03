import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Reads the initial theme from localStorage or system preference.
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Applies the theme class to the <html> element and persists to localStorage.
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  localStorage.setItem('theme', theme);
}

export const useThemeStore = create<ThemeState>((set) => {
  // Apply theme on store creation
  const initial = getInitialTheme();
  applyTheme(initial);

  return {
    theme: initial,
    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(next);
        return { theme: next };
      }),
  };
});
