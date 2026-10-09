import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ExpensesProvider } from '@/lib/ExpensesContext';
import { ensureRTL } from '@/lib/rtl';
import { useIsDark, useThemeColors } from '@/lib/theme';

export default function RootLayout() {
  const isDark = useIsDark();
  const colors = useThemeColors();

  useEffect(() => {
    ensureRTL().catch(() => {});
  }, []);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navTheme}>
        <ExpensesProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerTitleStyle: { fontWeight: '700', fontSize: 19 },
              headerTintColor: colors.primary,
              headerStyle: { backgroundColor: colors.card },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="expense" options={{ presentation: 'modal', title: 'مصروف جديد' }} />
          </Stack>
        </ExpensesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
