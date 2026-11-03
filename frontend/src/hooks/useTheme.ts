import { useThemeStore } from '@/stores/themeStore';

export const useTheme = () => {
  const { theme, toggleTheme } = useThemeStore();
  return { theme, toggleTheme };
};

