import { StyleSheet, View } from 'react-native';

type Props = { ratio: number; color: string; trackColor: string; height?: number };

export function ProgressBar({ ratio, color, trackColor, height = 12 }: Props) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}
    >
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
