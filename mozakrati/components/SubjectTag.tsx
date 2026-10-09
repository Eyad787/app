import { StyleSheet, View } from 'react-native';

import { withAlpha } from '@/constants/colors';
import { useColors } from '@/hooks/useTheme';
import type { Subject } from '@/lib/types';

import { AppText } from './AppText';

/** اسم المادة بلونها (أو "عامة") */
export function SubjectTag({ subject, fallback = 'General' }: { subject: Subject | null | undefined; fallback?: string }) {
  const colors = useColors();
  const color = subject?.color ?? colors.textMuted;
  return (
    <View style={[styles.tag, { backgroundColor: withAlpha(color, 0.14) }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="tiny" color={subject ? color : colors.textMuted} numberOfLines={1}>
        {subject?.name ?? fallback}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '100%',
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
