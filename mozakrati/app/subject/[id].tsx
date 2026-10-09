import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ClassCard } from '@/components/ClassCard';
import { EmptyState } from '@/components/EmptyState';
import { ExamCard } from '@/components/ExamCard';
import { Columns } from '@/components/Grid';
import { Section } from '@/components/Section';
import { TaskRow } from '@/components/TaskRow';
import { MAX_CONTENT_WIDTH } from '@/constants/layout';
import { WEEKDAY_NAMES } from '@/constants/labels';
import { useToday } from '@/hooks/useNow';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useResponsive } from '@/hooks/useResponsive';
import { useColors } from '@/hooks/useTheme';
import { useData } from '@/lib/db/DataProvider';
import { formatDuration } from '@/lib/logic/dates';
import { splitExams } from '@/lib/logic/exams';
import { minutesForSubject } from '@/lib/logic/stats';
import { sortTasks } from '@/lib/logic/tasks';
import { WEEK_ORDER } from '@/constants/labels';

export default function SubjectDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { isWide } = useResponsive();
  const today = useToday();
  const { data, toggleTask, updateExam } = useData();
  const pomodoro = usePomodoro();
  const subject = data.subjects.find((s) => s.id === id);

  if (!subject) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'المادة' }} />
        <EmptyState icon="help-circle-outline" title="المادة دي مش موجودة" actionLabel="رجوع للمواد" onAction={() => router.replace('/subjects')} />
      </View>
    );
  }

  const order = (d: number) => WEEK_ORDER.indexOf(d as never);
  const slots = data.classes
    .filter((c) => c.subjectId === subject.id)
    .sort((a, b) => order(a.day) - order(b.day) || a.start.localeCompare(b.start));
  const { upcoming, past } = splitExams(data.exams.filter((e) => e.subjectId === subject.id), today);
  const tasks = sortTasks(data.tasks.filter((t) => t.subjectId === subject.id));
  const studied = minutesForSubject(data.studySessions, subject.id);
  const sessions = data.studySessions.filter((s) => s.subjectId === subject.id).length;

  const startStudy = () => {
    if (pomodoro.state.status === 'idle') pomodoro.setSubject(subject.id);
    router.push('/pomodoro');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: subject.name,
          headerRight: () => (
            <Button title="تعديل" icon="create-outline" variant="ghost" small onPress={() => router.push({ pathname: '/subject-form', params: { id: subject.id } })} />
          ),
        }}
      />
      <View style={styles.inner}>
        <Card style={{ backgroundColor: subject.color, borderWidth: 0 }}>
          <AppText variant="title" color="#FFFFFF">
            {subject.name}
          </AppText>
          <View style={styles.stats}>
            <Stat label="الساعات المعتمدة" value={String(subject.creditHours)} />
            <Stat label="وقت المذاكرة" value={formatDuration(studied)} />
            <Stat label="جلسات" value={String(sessions)} />
          </View>
          {subject.instructor ? (
            <View style={styles.row}>
              <Ionicons name="person" size={16} color="#FFFFFF" />
              <AppText variant="label" color="#FFFFFF">
                {subject.instructor}
              </AppText>
            </View>
          ) : null}
          <Button title="ذاكر المادة دي" icon="play" variant="secondary" onPress={startStudy} style={styles.studyBtn} />
        </Card>

        <Columns wide={isWide}>
          <>
            <Section
              title="مواعيدها في الجدول"
              actionLabel="+ أضف"
              onAction={() => router.push({ pathname: '/class-form', params: { subjectId: subject.id } })}
            >
              {slots.length === 0 ? (
                <AppText variant="caption" muted>
                  لسه مش متضافة في الجدول.
                </AppText>
              ) : (
                slots.map((c) => (
                  <View key={c.id} style={styles.slot}>
                    <AppText variant="caption" bold style={styles.dayName}>
                      {WEEKDAY_NAMES[c.day]}
                    </AppText>
                    <View style={styles.flex}>
                      <ClassCard item={c} subject={subject} onPress={() => router.push({ pathname: '/class-form', params: { id: c.id } })} />
                    </View>
                  </View>
                ))
              )}
            </Section>
            <Section
              title="المهام"
              actionLabel="+ أضف"
              onAction={() => router.push({ pathname: '/task-form', params: { subjectId: subject.id } })}
            >
              {tasks.length === 0 ? (
                <AppText variant="caption" muted>
                  مفيش مهام للمادة دي.
                </AppText>
              ) : (
                tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    subject={subject}
                    today={today}
                    onToggle={() => toggleTask(t.id)}
                    onPress={() => router.push({ pathname: '/task-form', params: { id: t.id } })}
                  />
                ))
              )}
            </Section>
          </>
          <Section
            title="الامتحانات والتسليمات"
            actionLabel="+ أضف"
            onAction={() => router.push({ pathname: '/exam-form', params: { subjectId: subject.id } })}
          >
            {upcoming.length + past.length === 0 ? (
              <AppText variant="caption" muted>
                مفيش امتحانات متسجلة.
              </AppText>
            ) : (
              [...upcoming, ...past].map((e) => (
                <ExamCard
                  key={e.id}
                  exam={e}
                  subject={subject}
                  today={today}
                  onPress={() => router.push({ pathname: '/exam-form', params: { id: e.id } })}
                  onToggleDone={() => updateExam(e.id, { done: !e.done })}
                />
              ))
            )}
          </Section>
        </Columns>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="tiny" color="#FFFFFF" style={styles.dim}>
        {label}
      </AppText>
      <AppText variant="label" bold color="#FFFFFF">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  inner: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', gap: 20 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  stat: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, minWidth: 96 },
  dim: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  studyBtn: { marginTop: 14, backgroundColor: '#FFFFFF' },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayName: { width: 52 },
});
