import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/constants/colors';

export function useThemeColors(): ThemeColors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}

export function useIsDark(): boolean {
  return useColorScheme() === 'dark';
}
