import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { IconButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { ClassCard } from '@/components/ClassCard';
import { EmptyState } from '@/components/EmptyState';
import { ExamCard } from '@/components/ExamCard';
import { Columns } from '@/components/Grid';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { TaskRow } from '@/components/TaskRow';
import { useNow } from '@/hooks/useNow';
import { phaseLabel, usePomodoro } from '@/hooks/usePomodoro';
import { useResponsive } from '@/hooks/useResponsive';
import { useTaskToggle } from '@/hooks/useTaskToggle';
import { useColors } from '@/hooks/useTheme';
import { useData, useSubjectMap, useSubjects } from '@/lib/db/DataProvider';
import { formatClock, formatDayDate, formatDuration, greeting, minutesOfDay, timeToMinutes, toDateKey } from '@/lib/logic/dates';
import { splitExams } from '@/lib/logic/exams';
import { classesForDay, currentAndNext } from '@/lib/logic/schedule';
import { goalProgress, minutesOn, streak } from '@/lib/logic/stats';
import { filterTasks } from '@/lib/logic/tasks';
import type { Weekday } from '@/lib/types';

export default function HomeScreen() {
  const colors = useColors();
  const { isWide } = useResponsive();
  const now = useNow();
  const today = toDateKey(now);
  const { data, updateExam } = useData();
  const { toggle, tasksForFilter, real } = useTaskToggle();
  const subjects = useSubjects();
  const subjectMap = useSubjectMap();
  const pomodoro = usePomodoro();

  const subjectIds = useMemo(() => new Set(subjects.map((s) => s.id)), [subjects]);
  const termClasses = useMemo(() => data.classes.filter((c) => subjectIds.has(c.subjectId)), [data.classes, subjectIds]);
  const todayClasses = classesForDay(termClasses, now.getDay() as Weekday);
  const nowMin = minutesOfDay(now);
  const { currentId, nextId } = currentAndNext(todayClasses, nowMin);

  const upcoming = splitExams(data.exams, today).upcoming;
  const nearest = upcoming[0];
  const todayTasks = filterTasks(tasksForFilter, 'today', today).map(real);
  const studied = minutesOn(data.studySessions, today);
  const goal = data.settings.dailyGoalMinutes;
  const days = streak(data.studySessions, today);
  const timerOn = pomodoro.state.status !== 'idle';

  const hello = `${greeting(now)}${data.profile.name ? `, ${data.profile.name.split(' ')[0]}` : ''} 👋`;

  const studyCard = (
    <Card style={[styles.hero, { backgroundColor: colors.primary }]}>
      <View style={styles.heroTop}>
        <View style={styles.flex}>
          <AppText variant="caption" color={colors.onPrimary} style={styles.dim}>
            Studied today
          </AppText>
          <AppText variant="title" color={colors.onPrimary}>
            {formatDuration(studied)}
          </AppText>
          {goal > 0 ? (
            <AppText variant="caption" color={colors.onPrimary} style={styles.dim}>
              of your {formatDuration(goal)} goal
              {days > 1 ? ` • 🔥 ${days}-day streak` : ''}
            </AppText>
          ) : null}
        </View>
        <Ionicons name="timer-outline" size={44} color={colors.onPrimary} style={styles.dim} />
      </View>
      {goal > 0 ? <ProgressBar value={goalProgress(studied, goal)} color={colors.onPrimary} height={8} /> : null}
      <Card
        onPress={() => router.push('/pomodoro')}
        style={[styles.startBtn, { backgroundColor: colors.card }]}
        padded={false}
        accessibilityLabel="Start studying"
      >
        <Ionicons name={timerOn ? 'time' : 'play'} size={20} color={colors.primary} />
        <AppText variant="label" bold color={colors.primary}>
          {timerOn
            ? `${phaseLabel(pomodoro.state.phase)} • ${formatClock(pomodoro.remainingMs)}${pomodoro.state.status === 'paused' ? ' (paused)' : ''}`
            : 'Start studying'}
        </AppText>
      </Card>
    </Card>
  );

  const classesSection = (
    <Section title="Today's classes" actionLabel="Full schedule" onAction={() => router.push('/schedule')}>
      {todayClasses.length === 0 ? (
        <Card>
          <EmptyState
            compact
            icon="cafe-outline"
            title={termClasses.length === 0 ? 'Your schedule is empty' : 'No classes today 🎉'}
            message={termClasses.length === 0 ? 'Add your lectures and sections so they show up here every day.' : 'A great day to study or review.'}
            actionLabel={termClasses.length === 0 ? 'Add class' : undefined}
            onAction={() => router.push({ pathname: '/class-form', params: { day: String(now.getDay()) } })}
          />
        </Card>
      ) : (
        todayClasses.map((c) => (
          <ClassCard
            key={c.id}
            item={c}
            subject={subjectMap.get(c.subjectId)}
            status={c.id === currentId ? 'current' : c.id === nextId ? 'next' : timeToMinutes(c.end) <= nowMin ? 'past' : null}
            onPress={() => router.push({ pathname: '/class-form', params: { id: c.id } })}
          />
        ))
      )}
    </Section>
  );

  const examSection = (
    <Section title="Next exam or deadline" actionLabel={upcoming.length > 1 ? `All (${upcoming.length})` : undefined} onAction={() => router.push('/exams')}>
      {nearest ? (
        <ExamCard
          big
          exam={nearest}
          subject={nearest.subjectId ? subjectMap.get(nearest.subjectId) : undefined}
          today={today}
          onPress={() => router.push({ pathname: '/exam-form', params: { id: nearest.id } })}
          onToggleDone={() => updateExam(nearest.id, { done: !nearest.done })}
        />
      ) : (
        <Card>
          <EmptyState
            compact
            icon="document-text-outline"
            title="No upcoming exams or deadlines"
            message="Add your quizzes, midterms and deadlines so you never miss one."
            actionLabel="Add exam"
            onAction={() => router.push('/exam-form')}
          />
        </Card>
      )}
    </Section>
  );

  const tasksSection = (
    <Section title="Today's tasks" actionLabel="All tasks" onAction={() => router.push('/tasks')}>
      {todayTasks.length === 0 ? (
        <Card>
          <EmptyState
            compact
            icon="checkmark-done-outline"
            title="Nothing urgent today"
            actionLabel="Add task"
            onAction={() => router.push({ pathname: '/task-form', params: { due: today } })}
          />
        </Card>
      ) : (
        <View style={styles.list}>
          {todayTasks.slice(0, 6).map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              subject={t.subjectId ? subjectMap.get(t.subjectId) : undefined}
              today={today}
              onToggle={() => toggle(t)}
              onPress={() => router.push({ pathname: '/task-form', params: { id: t.id } })}
            />
          ))}
        </View>
      )}
    </Section>
  );

  return (
    <Screen
      title={hello}
      subtitle={formatDayDate(today, true)}
      actions={isWide ? null : <IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />}
    >
      {subjects.length === 0 ? (
        <Card onPress={() => router.push('/subject-form')} style={{ backgroundColor: colors.warningSoft }}>
          <View style={styles.banner}>
            <Ionicons name="book" size={26} color={colors.warning} />
            <View style={styles.flex}>
              <AppText variant="label" bold>
                Start by adding your subjects
              </AppText>
              <AppText variant="caption" muted>
                Everything in the app (schedule, exams, study time) is linked to your subjects.
              </AppText>
            </View>
            <Ionicons name="add-circle" size={28} color={colors.warning} />
          </View>
        </Card>
      ) : null}
      <Columns wide={isWide}>
        <>
          {studyCard}
          {classesSection}
        </>
        <>
          {examSection}
          {tasksSection}
        </>
      </Columns>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dim: { opacity: 0.85 },
  hero: { gap: 14, borderWidth: 0 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 0,
  },
  list: { gap: 8 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
