import { useMemo, useState } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import type { DayTotal } from '@/lib/calculations';
import { formatDayLabel } from '@/lib/dates';
import { formatMoney, formatNumber } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';
import type { DateKey } from '@/lib/types';

import { AppText } from './AppText';

type Props = {
  data: DayTotal[];
  currency: string;
  today: DateKey;
  height?: number;
};

const AXIS_HEIGHT = 22;
const TOP_PAD = 8;
const LABEL_DAYS = new Set([1, 5, 10, 15, 20, 25]);

/** مستطيل بزوايا دائرية من فوق بس (القاعدة مستقيمة على المحور) */
function topRoundedBar(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

export function BarChart({ data, currency, today, height = 180 }: Props) {
  const colors = useThemeColors();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const max = useMemo(() => Math.max(0, ...data.map((d) => d.total)), [data]);
  const plotHeight = height - AXIS_HEIGHT - TOP_PAD;
  const slot = width > 0 ? width / data.length : 0;
  const barWidth = Math.max(2, slot - 2);
  const isRTL = I18nManager.isRTL;
  // في العربي اليوم الأول يبقى على اليمين
  const xFor = (index: number) => (isRTL ? width - (index + 1) * slot : index * slot) + (slot - barWidth) / 2;

  const selectedDay = selected !== null ? data[selected] : null;

  return (
    <View>
      <View style={styles.tooltip}>
        {selectedDay ? (
          <AppText variant="label" center>
            {formatDayLabel(selectedDay.date, today)}: {formatMoney(selectedDay.total, currency)}
          </AppText>
        ) : (
          <AppText variant="caption" muted center>
            اضغط على أي عمود عشان تشوف مصاريف اليوم
          </AppText>
        )}
      </View>
      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            <Line
              x1={0}
              x2={width}
              y1={TOP_PAD + plotHeight}
              y2={TOP_PAD + plotHeight}
              stroke={colors.border}
              strokeWidth={1}
            />
            {data.map((d, i) => {
              const h = max > 0 ? (d.total / max) * plotHeight : 0;
              const x = xFor(i);
              const isSelected = selected === i;
              const isToday = d.date === today;
              const fill = isSelected || isToday ? colors.primary : `${colors.primary}99`;
              return (
                <DayBar
                  key={d.day}
                  hitX={isRTL ? width - (i + 1) * slot : i * slot}
                  slot={slot}
                  height={height}
                  bar={h > 0 ? topRoundedBar(x, TOP_PAD + plotHeight - h, barWidth, h, 4) : null}
                  fill={fill}
                  onPress={() => setSelected(isSelected ? null : i)}
                />
              );
            })}
            {data.map((d, i) =>
              LABEL_DAYS.has(d.day) || d.day === data.length ? (
                <SvgText
                  key={`l-${d.day}`}
                  x={xFor(i) + barWidth / 2}
                  y={height - 6}
                  fontSize={11}
                  fill={colors.textMuted}
                  textAnchor="middle"
                >
                  {d.day}
                </SvgText>
              ) : null,
            )}
          </Svg>
        ) : null}
      </View>
      {max > 0 ? (
        <AppText variant="caption" muted>
          أعلى يوم: {formatNumber(max)} {currency}
        </AppText>
      ) : null}
    </View>
  );
}

type DayBarProps = {
  hitX: number;
  slot: number;
  height: number;
  bar: string | null;
  fill: string;
  onPress: () => void;
};

function DayBar({ hitX, slot, height, bar, fill, onPress }: DayBarProps) {
  return (
    <>
      {bar ? <Path d={bar} fill={fill} /> : null}
      <Rect x={hitX} y={0} width={slot} height={height} fill="#000000" fillOpacity={0} onPress={onPress} />
    </>
  );
}

const styles = StyleSheet.create({
  tooltip: { minHeight: 28, justifyContent: 'center', marginBottom: 6 },
});
