import { Pressable, StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/useTheme';

import { AppText } from './AppText';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** لون المادة (نقطة صغيرة + لون التحديد) */
  color?: string;
  count?: number;
};

export function Chip({ label, selected, onPress, color, count }: Props) {
  const colors = useColors();
  const active = color ?? colors.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? active : colors.card,
          borderColor: selected ? active : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {color && !selected ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
      <AppText variant="caption" bold color={selected ? (color ? '#FFFFFF' : colors.onPrimary) : colors.text}>
        {label}
      </AppText>
      {count != null ? (
        <View style={[styles.count, { backgroundColor: selected ? 'rgba(255,255,255,0.25)' : colors.cardAlt }]}>
          <AppText variant="tiny" color={selected ? (color ? '#FFFFFF' : colors.onPrimary) : colors.textMuted}>
            {count}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  count: { minWidth: 20, paddingHorizontal: 5, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
