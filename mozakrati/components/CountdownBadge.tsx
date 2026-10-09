import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/useTheme';
import { countdownLabel, urgencyOf } from '@/lib/logic/countdown';
import type { DateKey } from '@/lib/types';

import { AppText } from './AppText';

/** عدّ تنازلي: أحمر لو فاضل أقل من 3 أيام */
export function CountdownBadge({ date, today, done }: { date: DateKey; today: DateKey; done?: boolean }) {
  const colors = useColors();
  if (done) {
    return (
      <View style={[styles.badge, { backgroundColor: colors.successSoft }]}>
        <AppText variant="tiny" color={colors.success}>
          Done ✓
        </AppText>
      </View>
    );
  }
  const u = urgencyOf(date, today);
  const palette = {
    past: { bg: colors.cardAlt, fg: colors.textMuted },
    urgent: { bg: colors.dangerSoft, fg: colors.danger },
    soon: { bg: colors.warningSoft, fg: colors.warning },
    normal: { bg: colors.primarySoft, fg: colors.primary },
  }[u];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <AppText variant="tiny" color={palette.fg}>
        {countdownLabel(date, today)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-start' },
});
