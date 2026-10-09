import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Grid } from '@/components/Grid';
import { Screen } from '@/components/Screen';
import { withAlpha } from '@/constants/colors';
import { WEEKDAY_SHORT } from '@/constants/labels';
import { useToday } from '@/hooks/useNow';
import { useResponsive } from '@/hooks/useResponsive';
import { useColors } from '@/hooks/useTheme';
import { useData, useSubjects } from '@/lib/db/DataProvider';
import { countWord, formatDuration } from '@/lib/logic/dates';
import { splitExams } from '@/lib/logic/exams';
import { minutesForSubject } from '@/lib/logic/stats';
import { countdownLabel } from '@/lib/logic/countdown';

export default function SubjectsScreen() {
  const colors = useColors();
  const { columns } = useResponsive();
  const today = useToday();
  const { data } = useData();
  const subjects = useSubjects();
  const upcoming = splitExams(data.exams, today).upcoming;
  const totalHours = subjects.reduce((s, x) => s + x.creditHours, 0);

  return (
    <Screen
      title="Subjects"
      subtitle={subjects.length ? `${countWord(subjects.length, 'subject')} • ${countWord(totalHours, 'credit hour')}` : undefined}
      onAdd={() => router.push('/subject-form')}
      addLabel="Add subject"
    >
      {subjects.length === 0 ? (
        <EmptyState
          icon="library-outline"
          title="No subjects yet"
          message="Add the subjects you're taking this term. Each one gets its own color in your schedule and exams."
          actionLabel="Add your first subject"
          onAction={() => router.push('/subject-form')}
        />
      ) : (
        <Grid columns={Math.max(columns, 1)}>
          {subjects.map((s) => {
            const slots = data.classes.filter((c) => c.subjectId === s.id);
            const days = [...new Set(slots.map((c) => WEEKDAY_SHORT[c.day]))];
            const exam = upcoming.find((e) => e.subjectId === s.id);
            const pending = data.tasks.filter((t) => t.subjectId === s.id && !t.done).length;
            const studied = minutesForSubject(data.studySessions, s.id);
            return (
              <Card key={s.id} onPress={() => router.push({ pathname: '/subject/[id]', params: { id: s.id } })} padded={false}>
                <View style={[styles.head, { backgroundColor: s.color }]}>
                  <AppText variant="heading" color="#FFFFFF" numberOfLines={1} style={styles.flex}>
                    {s.name}
                  </AppText>
                  <View style={styles.hours}>
                    <AppText variant="tiny" color="#FFFFFF">
                      {s.creditHours} cr
                    </AppText>
                  </View>
                </View>
                <View style={styles.body}>
                  {s.instructor ? <Line icon="person-outline" text={s.instructor} /> : null}
                  <Line icon="calendar-outline" text={days.length ? days.join(', ') : 'Not in your schedule yet'} />
                  <Line icon="time-outline" text={`Studied ${formatDuration(studied)}`} />
                  <View style={styles.footer}>
                    {exam ? (
                      <View style={[styles.badge, { backgroundColor: withAlpha(s.color, 0.14) }]}>
                        <AppText variant="tiny" color={s.color}>
                          Exam: {countdownLabel(exam.date, today)}
                        </AppText>
                      </View>
                    ) : null}
                    {pending > 0 ? (
                      <View style={[styles.badge, { backgroundColor: colors.cardAlt }]}>
                        <AppText variant="tiny" muted>
                          {countWord(pending, 'task')}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Card>
            );
          })}
        </Grid>
      )}
    </Screen>
  );
}

function Line({ icon, text }: { icon: 'person-outline' | 'calendar-outline' | 'time-outline'; text: string }) {
  const colors = useColors();
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <AppText variant="caption" muted numberOfLines={1} style={styles.flex}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  hours: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  body: { padding: 16, gap: 6 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});
