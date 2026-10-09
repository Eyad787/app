import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { addDays, addMonths, daysInMonth, formatMonth, monthKeyOf, parseMonthKey, toDateKey, WEEK_START_DAY } from '@/lib/dates';
import { nextIcon, prevIcon } from '@/lib/rtlIcons';
import { useThemeColors } from '@/lib/theme';
import type { DateKey } from '@/lib/types';

import { AppText } from './AppText';
import { Button } from './Button';
import { Chip } from './Chip';

type Props = {
  visible: boolean;
  value: DateKey;
  today: DateKey;
  onSelect: (date: DateKey) => void;
  onClose: () => void;
};

// حروف أيام الأسبوع بالترتيب من السبت
const WEEKDAY_SHORT = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];

/** منتقي تاريخ مكتوب بالكامل بـ JavaScript عشان يشتغل على Expo Go ويدعم العربي */
export function DatePickerModal({ visible, value, today, onSelect, onClose }: Props) {
  const colors = useThemeColors();
  const [month, setMonth] = useState(monthKeyOf(value));

  useEffect(() => {
    if (visible) setMonth(monthKeyOf(value));
  }, [visible, value]);

  const cells = useMemo(() => {
    const { year, month: m } = parseMonthKey(month);
    const firstDay = new Date(year, m, 1).getDay();
    const leading = (firstDay - WEEK_START_DAY + 7) % 7;
    const count = daysInMonth(month);
    const result: (DateKey | null)[] = Array.from({ length: leading }, () => null);
    for (let d = 1; d <= count; d++) result.push(toDateKey(new Date(year, m, d)));
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [month]);

  const canGoNext = month < monthKeyOf(today);
  const pick = (date: DateKey) => {
    onSelect(date);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="إغلاق">
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.header}>
            <Pressable
              onPress={() => setMonth(addMonths(month, -1))}
              hitSlop={10}
              accessibilityLabel="الشهر السابق"
              style={[styles.navBtn, { backgroundColor: colors.primarySoft }]}
            >
              <Ionicons name={prevIcon()} size={24} color={colors.primary} />
            </Pressable>
            <AppText variant="heading" center style={styles.flex}>
              {formatMonth(month)}
            </AppText>
            <Pressable
              onPress={() => canGoNext && setMonth(addMonths(month, 1))}
              disabled={!canGoNext}
              hitSlop={10}
              accessibilityLabel="الشهر التالي"
              style={[styles.navBtn, { backgroundColor: colors.primarySoft, opacity: canGoNext ? 1 : 0.35 }]}
            >
              <Ionicons name={nextIcon()} size={24} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {WEEKDAY_SHORT.map((d) => (
              <View key={d} style={styles.cell}>
                <AppText variant="caption" muted center>
                  {d}
                </AppText>
              </View>
            ))}
            {cells.map((date, i) => {
              if (!date) return <View key={`e${i}`} style={styles.cell} />;
              const isFuture = date > today;
              const isSelected = date === value;
              const isToday = date === today;
              return (
                <View key={date} style={styles.cell}>
                  <Pressable
                    disabled={isFuture}
                    onPress={() => pick(date)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: isFuture }}
                    style={({ pressed }) => [
                      styles.day,
                      isSelected && { backgroundColor: colors.primary },
                      !isSelected && isToday && { borderWidth: 2, borderColor: colors.primary },
                      pressed && !isSelected && { backgroundColor: colors.cardAlt },
                    ]}
                  >
                    <AppText
                      variant="label"
                      center
                      color={isSelected ? colors.onPrimary : isFuture ? colors.border : colors.text}
                    >
                      {Number(date.slice(8, 10))}
                    </AppText>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={styles.quick}>
            <Chip label="النهارده" selected={value === today} onPress={() => pick(today)} />
            <Chip label="امبارح" selected={value === addDays(today, -1)} onPress={() => pick(addDays(today, -1))} />
          </View>
          <Button title="إلغاء" variant="ghost" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: { borderRadius: 24, padding: 16, gap: 10, maxWidth: 440, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  navBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3, alignItems: 'center', justifyContent: 'center' },
  day: { width: '100%', height: '100%', borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  quick: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 4 },
});
