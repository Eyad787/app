import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { getCategory } from '@/constants/categories';
import { formatMoney } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';
import type { Expense } from '@/lib/types';

import { AppText } from './AppText';
import { CategoryIcon } from './CategoryIcon';

type Props = {
  expense: Expense;
  currency: string;
  onPress?: () => void;
  /** لو موجودة، السحب يمين/شمال أو الضغط المطول بيطلب الحذف */
  onDelete?: () => void;
};

const SWIPE_THRESHOLD = 90;
const MAX_SWIPE = 130;

export function ExpenseRow({ expense, currency, onPress, onDelete }: Props) {
  const colors = useThemeColors();
  const category = getCategory(expense.category);
  const translateX = useRef(new Animated.Value(0)).current;

  // خلفية الحذف تظهر بس وقت السحب
  const deleteOpacity = translateX.interpolate({
    inputRange: [-MAX_SWIPE, -1, 0, 1, MAX_SWIPE],
    outputRange: [1, 1, 0, 1, 1],
  });

  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          !!onDeleteRef.current && Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.8,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => {
          translateX.setValue(Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, g.dx)));
        },
        onPanResponderRelease: (_, g) => {
          const shouldDelete = Math.abs(g.dx) > SWIPE_THRESHOLD;
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
          if (shouldDelete) onDeleteRef.current?.();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [translateX],
  );

  return (
    <View style={styles.wrapper}>
      {onDelete ? (
        <Animated.View style={[styles.deleteBg, { backgroundColor: colors.danger, opacity: deleteOpacity }]}>
          <Ionicons name="trash" size={24} color="#FFFFFF" />
          <Ionicons name="trash" size={24} color="#FFFFFF" />
        </Animated.View>
      ) : null}
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <Pressable
          onPress={onPress}
          onLongPress={onDelete}
          delayLongPress={450}
          accessibilityRole="button"
          accessibilityLabel={`${category.label}، ${formatMoney(expense.amount, currency)}${
            expense.note ? `، ${expense.note}` : ''
          }`}
          accessibilityHint={onDelete ? 'اضغط للتعديل، أو اضغط مطولاً للحذف' : undefined}
          style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.cardAlt : colors.card }]}
        >
          <CategoryIcon category={expense.category} />
          <View style={styles.texts}>
            <AppText variant="label" numberOfLines={1}>
              {category.label}
            </AppText>
            {expense.note ? (
              <AppText variant="caption" muted numberOfLines={1}>
                {expense.note}
              </AppText>
            ) : null}
          </View>
          <AppText variant="heading" style={styles.amount}>
            {formatMoney(expense.amount, currency)}
          </AppText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 16, overflow: 'hidden' },
  deleteBg: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 70,
  },
  texts: { flex: 1, gap: 2 },
  amount: { fontVariant: ['tabular-nums'] },
});
