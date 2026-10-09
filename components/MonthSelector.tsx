import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { formatMonth } from '@/lib/dates';
import { nextIcon, prevIcon } from '@/lib/rtlIcons';
import { useThemeColors } from '@/lib/theme';
import type { MonthKey } from '@/lib/types';

import { AppText } from './AppText';

type Props = {
  month: MonthKey;
  onPrev: () => void;
  onNext: () => void;
  canGoNext?: boolean;
};

export function MonthSelector({ month, onPrev, onNext, canGoNext = true }: Props) {
  const colors = useThemeColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Pressable
        onPress={onPrev}
        accessibilityRole="button"
        accessibilityLabel="الشهر السابق"
        hitSlop={8}
        style={({ pressed }) => [styles.arrow, { backgroundColor: colors.primarySoft, opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons name={prevIcon()} size={26} color={colors.primary} />
      </Pressable>
      <AppText variant="heading" center style={styles.title}>
        {formatMonth(month)}
      </AppText>
      <Pressable
        onPress={onNext}
        disabled={!canGoNext}
        accessibilityRole="button"
        accessibilityLabel="الشهر التالي"
        hitSlop={8}
        style={({ pressed }) => [
          styles.arrow,
          { backgroundColor: colors.primarySoft, opacity: !canGoNext ? 0.35 : pressed ? 0.7 : 1 },
        ]}
      >
        <Ionicons name={nextIcon()} size={26} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 8,
  },
  title: { flex: 1 },
  arrow: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
