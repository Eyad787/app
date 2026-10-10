import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PomodoroProvider } from '@/hooks/usePomodoro';
import { useTheme } from '@/hooks/useTheme';
import { DataProvider, useData } from '@/lib/db/DataProvider';

/** على الويب (بعد البناء) بنسجّل service worker علشان التطبيق يشتغل offline ويتسطّب كـ PWA */
function useServiceWorker() {
  useEffect(() => {
    if (Platform.OS !== 'web' || __DEV__) return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register(`${process.env.EXPO_BASE_URL ?? ''}/sw.js`).catch(() => undefined);
  }, []);
}

function AppStack() {
  const { colors } = useTheme();
  const { ready } = useData();

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.card },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="subject/[id]" options={{ title: 'Subject' }} />
      <Stack.Screen name="subject-form" options={{ presentation: 'modal', title: 'Subject' }} />
      <Stack.Screen name="class-form" options={{ presentation: 'modal', title: 'Class' }} />
      <Stack.Screen name="exam-form" options={{ presentation: 'modal', title: 'Exam or deadline' }} />
      <Stack.Screen name="task-form" options={{ presentation: 'modal', title: 'Task' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  useServiceWorker();

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
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
        <DataProvider>
          <PomodoroProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <AppStack />
          </PomodoroProvider>
        </DataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
