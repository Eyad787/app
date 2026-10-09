import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { getCategory } from '@/constants/categories';
import type { CategoryTotal } from '@/lib/calculations';
import { formatMoney, formatPercent } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';

import { AppText } from './AppText';
import { CategoryIcon } from './CategoryIcon';

type Props = {
  data: CategoryTotal[];
  total: number;
  currency: string;
  size?: number;
};

const STROKE = 26;
const GAP = 3;

export function DonutChart({ data, total, currency, size = 220 }: Props) {
  const colors = useThemeColors();
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const gap = data.length > 1 ? GAP : 0;

  let offset = 0;
  const segments = data.map((item) => {
    const length = (item.percent / 100) * circumference;
    const visible = Math.max(length - gap, 1);
    const seg = { item, dash: `${visible} ${circumference - visible}`, offset: -offset };
    offset += length;
    return seg;
  });

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} stroke={colors.cardAlt} strokeWidth={STROKE} fill="none" />
          <G rotation={-90} origin={`${center}, ${center}`}>
            {segments.map(({ item, dash, offset: o }) => (
              <Circle
                key={item.category}
                cx={center}
                cy={center}
                r={radius}
                stroke={getCategory(item.category).color}
                strokeWidth={STROKE}
                strokeDasharray={dash}
                strokeDashoffset={o}
                fill="none"
              />
            ))}
          </G>
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.centerLabel]} pointerEvents="none">
          <AppText variant="caption" muted center>
            الإجمالي
          </AppText>
          <AppText variant="heading" center numberOfLines={1} adjustsFontSizeToFit style={styles.centerAmount}>
            {formatMoney(total, currency)}
          </AppText>
        </View>
      </View>

      <View style={styles.legend}>
        {data.map((item) => {
          const cat = getCategory(item.category);
          return (
            <View key={item.category} style={styles.legendRow}>
              <CategoryIcon category={item.category} size={38} />
              <View style={styles.legendText}>
                <AppText variant="label">{cat.label}</AppText>
                <AppText variant="caption" muted>
                  {item.count} {item.count === 1 ? 'مصروف' : item.count === 2 ? 'مصروفين' : 'مصاريف'}
                </AppText>
              </View>
              <View style={styles.legendValues}>
                <AppText variant="label">{formatMoney(item.total, currency)}</AppText>
                <AppText variant="caption" muted>
                  {formatPercent(item.percent)}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 18 },
  centerLabel: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: STROKE + 12 },
  centerAmount: { maxWidth: '100%' },
  legend: { alignSelf: 'stretch', gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legendText: { flex: 1 },
  legendValues: { alignItems: 'flex-end' },
});
