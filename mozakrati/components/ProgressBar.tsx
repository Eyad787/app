import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/useTheme';

export function ProgressBar({ value, color, height = 10 }: { value: number; color?: string; height?: number }) {
  const colors = useColors();
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      style={[styles.track, { backgroundColor: colors.cardAlt, height, borderRadius: height / 2 }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: height / 2, backgroundColor: color ?? colors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', flexDirection: 'row' },
});
