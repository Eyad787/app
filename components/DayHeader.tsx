import { StyleSheet, View } from 'react-native';

import { formatDayLabel } from '@/lib/dates';
import { formatMoney } from '@/lib/format';
import type { DateKey } from '@/lib/types';

import { AppText } from './AppText';

type Props = { date: DateKey; total: number; currency: string; today: DateKey };

export function DayHeader({ date, total, currency, today }: Props) {
  return (
    <View style={styles.header}>
      <AppText variant="label" muted>
        {formatDayLabel(date, today)}
      </AppText>
      <AppText variant="label" muted>
        {formatMoney(total, currency)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 14,
    paddingBottom: 6,
  },
});
