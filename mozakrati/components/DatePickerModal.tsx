import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { I18nManager, Platform, Pressable, StyleSheet, View } from 'react-native';

import { MONTH_NAMES } from '@/constants/labels';
import { useColors } from '@/hooks/useTheme';
import { addDays, toDateKey } from '@/lib/logic/dates';
import type { DateKey } from '@/lib/types';

import { AppText } from './AppText';
import { Button } from './Button';
import { Chip } from './Chip';
import { Sheet } from './Sheet';

type Props = { visible: boolean; value: DateKey | null; today: DateKey; onSelect: (d: DateKey) => void; onClose: () => void };

// حروف الأيام بالترتيب من السبت
const WEEKDAY_SHORT = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];
const isRtl = Platform.OS === 'web' || I18nManager.isRTL;

/** منتقي تاريخ مكتوب بـ JavaScript علشان يشتغل على Expo Go والويب ويدعم العربي */
export function DatePickerModal({ visible, value, today, onSelect, onClose }: Props) {
  const colors = useColors();
  const initial = value ?? today;
  const [month, setMonth] = useState({ y: Number(initial.slice(0, 4)), m: Number(initial.slice(5, 7)) - 1 });

  useEffect(() => {
    if (visible) {
      const v = value ?? today;
      setMonth({ y: Number(v.slice(0, 4)), m: Number(v.slice(5, 7)) - 1 });
    }
  }, [visible, value, today]);

  const cells = useMemo(() => {
    const first = new Date(month.y, month.m, 1).getDay();
    const leading = (first + 1) % 7; // السبت أول الأسبوع
    const count = new Date(month.y, month.m + 1, 0).getDate();
    const out: (DateKey | null)[] = Array.from({ length: leading }, () => null);
    for (let d = 1; d <= count; d++) out.push(toDateKey(new Date(month.y, month.m, d)));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [month]);

  const shift = (delta: number) => {
    const d = new Date(month.y, month.m + delta, 1);
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };
  const pick = (d: DateKey) => {
    onSelect(d);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Pressable onPress={() => shift(-1)} accessibilityLabel="الشهر اللي فات" style={[styles.nav, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={isRtl ? 'chevron-forward' : 'chevron-back'} size={22} color={colors.primary} />
        </Pressable>
        <AppText variant="heading" center style={styles.flex}>
          {MONTH_NAMES[month.m]} {month.y}
        </AppText>
        <Pressable onPress={() => shift(1)} accessibilityLabel="الشهر الجاي" style={[styles.nav, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={isRtl ? 'chevron-back' : 'chevron-forward'} size={22} color={colors.primary} />
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
        {cells.map((d, i) => {
          if (!d) return <View key={`e${i}`} style={styles.cell} />;
          const selected = d === value;
          const isToday = d === today;
          return (
            <View key={d} style={styles.cell}>
              <Pressable
                onPress={() => pick(d)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.day,
                  selected && { backgroundColor: colors.primary },
                  !selected && isToday && { borderWidth: 2, borderColor: colors.primary },
                  pressed && !selected && { backgroundColor: colors.cardAlt },
                ]}
              >
                <AppText variant="label" center color={selected ? colors.onPrimary : d < today ? colors.textMuted : colors.text}>
                  {Number(d.slice(8))}
                </AppText>
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={styles.quick}>
        <Chip label="النهارده" selected={value === today} onPress={() => pick(today)} />
        <Chip label="بكرة" selected={value === addDays(today, 1)} onPress={() => pick(addDays(today, 1))} />
        <Chip label="بعد أسبوع" selected={value === addDays(today, 7)} onPress={() => pick(addDays(today, 7))} />
      </View>
      <Button title="إلغاء" variant="ghost" onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  nav: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  day: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  quick: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
});
