import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { EXAM_KIND_LABELS } from '@/constants/labels';
import { useColors } from '@/hooks/useTheme';
import { formatDayDate, formatTime } from '@/lib/logic/dates';
import { isSubmission } from '@/lib/logic/exams';
import type { DateKey, Exam, Subject } from '@/lib/types';

import { AppText } from './AppText';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { CountdownBadge } from './CountdownBadge';

type Props = {
  exam: Exam;
  subject: Subject | undefined;
  today: DateKey;
  onPress?: () => void;
  onToggleDone?: () => void;
  big?: boolean;
};

export function ExamCard({ exam, subject, today, onPress, onToggleDone, big }: Props) {
  const colors = useColors();
  const color = subject?.color ?? colors.primary;
  const submission = isSubmission(exam.kind);
  return (
    <Card onPress={onPress} accent={color}>
      <View style={styles.row}>
        {submission && onToggleDone ? (
          <Checkbox checked={exam.done} onToggle={onToggleDone} color={color} label="خلصت" />
        ) : null}
        <View style={styles.body}>
          <View style={styles.top}>
            <AppText variant="caption" bold color={color}>
              {EXAM_KIND_LABELS[exam.kind]}
            </AppText>
            <CountdownBadge date={exam.date} today={today} done={submission && exam.done} />
          </View>
          <AppText
            variant={big ? 'heading' : 'label'}
            bold
            numberOfLines={2}
            style={submission && exam.done ? { textDecorationLine: 'line-through', color: colors.textMuted } : undefined}
          >
            {subject?.name ?? 'عام'}
          </AppText>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <AppText variant="caption" muted>
                {formatDayDate(exam.date)}
                {exam.time ? ` • ${formatTime(exam.time)}` : ''}
              </AppText>
            </View>
            {exam.location ? (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <AppText variant="caption" muted numberOfLines={1}>
                  {exam.location}
                </AppText>
              </View>
            ) : null}
          </View>
          {exam.notes ? (
            <AppText variant="caption" muted numberOfLines={big ? 3 : 2}>
              {exam.notes}
            </AppText>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  body: { flex: 1, gap: 5, minWidth: 0 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
