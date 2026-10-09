import { StyleSheet, View, type ViewProps } from 'react-native';

import { useIsDark, useThemeColors } from '@/lib/theme';

export function Card({ style, ...rest }: ViewProps) {
  const colors = useThemeColors();
  const isDark = useIsDark();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.shadow },
        isDark ? styles.flat : styles.raised,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 18 },
  raised: {
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  flat: {},
});
