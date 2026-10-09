import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/constants/colors';

/** الوضع الفاتح أو الداكن حسب إعداد الجهاز */
export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? darkColors : lightColors, isDark };
}

export const useColors = (): ThemeColors => useTheme().colors;
