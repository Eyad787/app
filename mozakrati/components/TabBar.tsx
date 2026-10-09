import Ionicons from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import type { PressState } from '@/lib/rtl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_NAME } from '@/constants/labels';
import { SIDEBAR_WIDTH } from '@/constants/layout';
import { TABS, type TabItem } from '@/constants/navigation';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useColors } from '@/hooks/useTheme';
import { useData } from '@/lib/db/DataProvider';
import { formatClock } from '@/lib/logic/dates';

import { AppText } from './AppText';

type Props = BottomTabBarProps & { wide: boolean };

/** شريط تحت على الموبايل، وقائمة جانبية على الشاشات الكبيرة */
export function TabBar({ state, navigation, wide }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data } = useData();
  const pomodoro = usePomodoro();
  const activeName = state.routes[state.index]?.name;

  const go = (item: TabItem) => {
    const route = state.routes.find((r) => r.name === item.name);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (activeName !== item.name && !event.defaultPrevented) navigation.navigate(item.name);
  };

  if (wide) {
    const timerOn = pomodoro.state.status !== 'idle';
    return (
      <View style={[styles.sidebar, { backgroundColor: colors.card, borderColor: colors.border, paddingTop: insets.top + 20 }]}>
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Ionicons name="school" size={22} color={colors.onPrimary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="heading">{APP_NAME}</AppText>
            {data.profile.name ? (
              <AppText variant="caption" muted numberOfLines={1}>
                {data.profile.name}
              </AppText>
            ) : null}
          </View>
        </View>
        <View style={styles.sideItems}>
          {TABS.map((item) => {
            const active = item.name === activeName;
            return (
              <Pressable
                key={item.name}
                onPress={() => go(item)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={({ hovered }: PressState) => [
                  styles.sideItem,
                  active ? { backgroundColor: colors.primarySoft } : hovered ? { backgroundColor: colors.cardAlt } : null,
                ]}
              >
                <Ionicons name={active ? item.activeIcon : item.icon} size={22} color={active ? colors.primary : colors.textMuted} />
                <AppText variant="label" style={styles.flex} color={active ? colors.primary : colors.text}>
                  {item.title}
                </AppText>
                {item.name === 'pomodoro' && timerOn ? (
                  <AppText variant="tiny" color={colors.primary}>
                    {formatClock(pomodoro.remainingMs)}
                  </AppText>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.bottom, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: Math.max(insets.bottom, 6) }]}>
      {TABS.filter((t) => t.mobile).map((item) => {
        const active = item.name === activeName;
        return (
          <Pressable
            key={item.name}
            onPress={() => go(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.title}
            style={styles.bottomItem}
          >
            <View style={[styles.iconPill, active && { backgroundColor: colors.primarySoft }]}>
              <Ionicons name={active ? item.activeIcon : item.icon} size={22} color={active ? colors.primary : colors.textMuted} />
            </View>
            <AppText variant="tiny" center color={active ? colors.primary : colors.textMuted} numberOfLines={1}>
              {item.title}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sidebar: { width: SIDEBAR_WIDTH, height: '100%', borderEndWidth: 1, paddingHorizontal: 14, gap: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6 },
  logo: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sideItems: { gap: 4 },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, minHeight: 46, borderRadius: 12 },
  bottom: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 6 },
  bottomItem: { flex: 1, alignItems: 'center', gap: 2, minHeight: 52 },
  iconPill: { width: 54, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
