import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { formatTime } from '@/lib/logic/dates';
import type { TimeHM } from '@/lib/types';

import { AppText } from './AppText';
import { Button } from './Button';
import { Chip } from './Chip';
import { Sheet } from './Sheet';

type Props = { visible: boolean; value: TimeHM | null; title?: string; onSelect: (t: TimeHM) => void; onClose: () => void };

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const pad = (n: number) => String(n).padStart(2, '0');
const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`;

/** منتقي ساعة بسيط: اختار الساعة وبعدين الدقايق */
export function TimePickerModal({ visible, value, title = 'Pick a time', onSelect, onClose }: Props) {
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const [h, m] = (value ?? '09:00').split(':').map(Number);
    setHour(h);
    setMinute(m - (m % 5));
  }, [visible, value]);

  const result = `${pad(hour)}:${pad(minute)}`;
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <AppText variant="display" center>
        {formatTime(result)}
      </AppText>
      <AppText variant="label" muted>
        Hour
      </AppText>
      <View style={styles.wrap}>
        {HOURS.map((h) => (
          <Chip key={h} label={hourLabel(h)} selected={h === hour} onPress={() => setHour(h)} />
        ))}
      </View>
      <AppText variant="label" muted>
        Minutes
      </AppText>
      <View style={styles.wrap}>
        {MINUTES.map((m) => (
          <Chip key={m} label={pad(m)} selected={m === minute} onPress={() => setMinute(m)} />
        ))}
      </View>
      <View style={styles.row}>
        <Button title="Cancel" variant="ghost" onPress={onClose} style={styles.flex} />
        <Button
          title="OK"
          onPress={() => {
            onSelect(result);
            onClose();
          }}
          style={styles.flex}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});
