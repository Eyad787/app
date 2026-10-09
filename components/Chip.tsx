import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useThemeColors } from '@/lib/theme';

import { AppText } from './AppText';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
  color?: string;
};

export function Chip({ label, selected, onPress, icon, color }: Props) {
  const colors = useThemeColors();
  const accent = color ?? colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? accent : colors.card,
          borderColor: selected ? accent : colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={selected ? '#FFFFFF' : accent} /> : null}
      <AppText variant="label" color={selected ? '#FFFFFF' : colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    borderWidth: 1,
  },
});
