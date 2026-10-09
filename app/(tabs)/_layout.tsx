import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';

import { useThemeColors } from '@/lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const icon =
  (name: IconName, activeName: IconName) =>
  ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? activeName : name} size={size + 2} color={color} />
  );

export default function TabsLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, minHeight: 64 },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'الرئيسية', tabBarIcon: icon('home-outline', 'home') }} />
      <Tabs.Screen
        name="stats"
        options={{ title: 'الإحصائيات', tabBarIcon: icon('pie-chart-outline', 'pie-chart') }}
      />
      <Tabs.Screen name="expenses" options={{ title: 'كل المصاريف', tabBarIcon: icon('list-outline', 'list') }} />
      <Tabs.Screen
        name="settings"
        options={{ title: 'الإعدادات', tabBarIcon: icon('settings-outline', 'settings') }}
      />
    </Tabs>
  );
}
