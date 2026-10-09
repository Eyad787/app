import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { PressState } from '@/lib/rtl';

import { RADIUS } from '@/constants/layout';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  /** شريط بلون المادة على جنب الكارت */
  accent?: string;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  accessibilityLabel?: string;
};

export function Card({ children, onPress, onLongPress, accent, style, padded = true, accessibilityLabel }: Props) {
  const { colors, isDark } = useTheme();
  const base = [
    styles.card,
    { backgroundColor: colors.card, borderColor: isDark ? colors.border : 'transparent' },
    !isDark && styles.shadow,
    padded && styles.padded,
    accent ? { borderStartWidth: 5, borderStartColor: accent } : null,
    style,
  ];
  if (!onPress && !onLongPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed, hovered }: PressState) => [
        base,
        hovered && { backgroundColor: colors.cardAlt },
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS, borderWidth: 1, overflow: 'hidden' },
  padded: { padding: 16 },
  shadow: {
    shadowColor: '#1C1E2B',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
