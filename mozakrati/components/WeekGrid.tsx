import { Pressable, StyleSheet, View } from 'react-native';
import type { PressState } from '@/lib/rtl';

import { withAlpha } from '@/constants/colors';
import { CLASS_KIND_LABELS, WEEKDAY_NAMES } from '@/constants/labels';
import { useColors } from '@/hooks/useTheme';
import { formatTime, timeToMinutes } from '@/lib/logic/dates';
import { classesForDay, hourRange, layoutDay } from '@/lib/logic/schedule';
import type { ClassSession, Subject, Weekday } from '@/lib/types';

import { AppText } from './AppText';

const HOUR_H = 64;
const GUTTER = 56;

type Props = {
  days: Weekday[];
  classes: ClassSession[];
  subjects: Map<string, Subject>;
  todayWeekday: Weekday;
  nowMinutes: number;
  onPressClass: (c: ClassSession) => void;
  onPressDay: (day: Weekday) => void;
};

/** الأسبوع كله في جدول زمني (للشاشات الكبيرة) */
export function WeekGrid({ days, classes, subjects, todayWeekday, nowMinutes, onPressClass, onPressDay }: Props) {
  const colors = useColors();
  const { from, to } = hourRange(classes);
  const hours = Array.from({ length: to - from }, (_, i) => from + i);
  const height = hours.length * HOUR_H;
  const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
        <View style={{ width: GUTTER }} />
        {days.map((d) => (
          <Pressable key={d} style={styles.dayHead} onPress={() => onPressDay(d)} accessibilityRole="button" accessibilityLabel={`Add a class on ${WEEKDAY_NAMES[d]}`}>
            <View style={[styles.dayPill, d === todayWeekday && { backgroundColor: colors.primary }]}>
              <AppText variant="label" bold center color={d === todayWeekday ? colors.onPrimary : colors.text}>
                {WEEKDAY_NAMES[d]}
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.body}>
        <View style={{ width: GUTTER, height }}>
          {hours.map((h, i) => (
            <AppText key={h} variant="tiny" muted center style={[styles.hourLabel, { top: i * HOUR_H - 7 }]}>
              {i === 0 ? '' : hourLabel(h)}
            </AppText>
          ))}
        </View>
        {days.map((d) => {
          const positioned = layoutDay(classesForDay(classes, d));
          const isToday = d === todayWeekday;
          return (
            <View
              key={d}
              style={[
                styles.dayCol,
                { height, borderStartColor: colors.border },
                isToday && { backgroundColor: withAlpha(colors.primary, 0.04) },
              ]}
            >
              {hours.map((h, i) => (
                <View key={h} style={[styles.hourLine, { top: i * HOUR_H, borderTopColor: colors.border }]} />
              ))}
              {positioned.map(({ item, column, columns }) => {
                const s = subjects.get(item.subjectId);
                const color = s?.color ?? colors.primary;
                const top = ((timeToMinutes(item.start) - from * 60) / 60) * HOUR_H;
                const h = ((timeToMinutes(item.end) - timeToMinutes(item.start)) / 60) * HOUR_H;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => onPressClass(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`${s?.name ?? ''} ${CLASS_KIND_LABELS[item.kind]}`}
                    style={({ hovered }: PressState) => [
                      styles.block,
                      {
                        top: top + 1,
                        height: Math.max(22, h - 2),
                        left: `${(column / columns) * 100}%`,
                        width: `${100 / columns}%`,
                        backgroundColor: withAlpha(color, hovered ? 0.3 : 0.18),
                        borderStartColor: color,
                      },
                    ]}
                  >
                    <AppText variant="tiny" bold color={color} numberOfLines={2}>
                      {s?.name ?? 'Subject'}
                    </AppText>
                    {h >= 44 ? (
                      <AppText variant="tiny" muted numberOfLines={1}>
                        {CLASS_KIND_LABELS[item.kind]} • {formatTime(item.start)}
                      </AppText>
                    ) : null}
                    {h >= 64 && item.location ? (
                      <AppText variant="tiny" muted numberOfLines={1}>
                        {item.location}
                      </AppText>
                    ) : null}
                  </Pressable>
                );
              })}
              {isToday && nowMinutes >= from * 60 && nowMinutes <= to * 60 ? (
                <View style={[styles.nowLine, { top: ((nowMinutes - from * 60) / 60) * HOUR_H, backgroundColor: colors.danger }]} />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 10 },
  dayHead: { flex: 1, alignItems: 'center' },
  dayPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  body: { flexDirection: 'row', paddingVertical: 8 },
  hourLabel: { position: 'absolute', width: GUTTER },
  dayCol: { flex: 1, borderStartWidth: 1, position: 'relative' },
  hourLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: StyleSheet.hairlineWidth },
  block: { position: 'absolute', borderRadius: 8, borderStartWidth: 3, paddingHorizontal: 6, paddingVertical: 3, overflow: 'hidden' },
  nowLine: { position: 'absolute', left: 0, right: 0, height: 2 },
});
