import Ionicons from '@expo/vector-icons/Ionicons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button, IconButton } from '@/components/Button';
import { Card } from '@/components/Card';
import { SubjectPicker } from '@/components/forms';
import { Columns } from '@/components/Grid';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { SubjectTag } from '@/components/SubjectTag';
import { PHASE_LABELS } from '@/constants/labels';
import { useToday } from '@/hooks/useNow';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useResponsive } from '@/hooks/useResponsive';
import { useColors } from '@/hooks/useTheme';
import { useData, useSubjectMap, useSubjects } from '@/lib/db/DataProvider';
import { formatClock, formatDuration, formatTime, minutesOfDay, minutesToTime } from '@/lib/logic/dates';
import { minutesOn } from '@/lib/logic/stats';

const KEEP_AWAKE_TAG = 'pomodoro';

export default function PomodoroScreen() {
  const colors = useColors();
  const { isWide, width } = useResponsive();
  const today = useToday();
  const { data } = useData();
  const subjects = useSubjects();
  const subjectMap = useSubjectMap();
  const p = usePomodoro();
  const { state } = p;
  const s = data.settings.pomodoro;

  const running = state.status === 'running';
  const idle = state.status === 'idle';
  const isBreak = state.phase !== 'work';
  const ringColor = isBreak ? colors.success : state.subjectId ? (subjectMap.get(state.subjectId)?.color ?? colors.primary) : colors.primary;
  const ringSize = Math.min(isWide ? 320 : width - 80, 300);
  const cyclePos = state.completedWork % s.sessionsBeforeLongBreak;
  const filledDots = state.phase === 'longBreak' ? s.sessionsBeforeLongBreak : cyclePos;

  // الشاشة ماتطفيش والمؤقت شغال
  useEffect(() => {
    if (!running) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
    return () => {
      try {
        deactivateKeepAwake(KEEP_AWAKE_TAG);
      } catch {
        // مش مدعوم
      }
    };
  }, [running]);

  const todaySessions = data.studySessions.filter((x) => x.date === today).slice(-6).reverse();
  const studiedToday = minutesOn(data.studySessions, today);

  const doneMessage =
    p.lastCompleted === 'work'
      ? `Great job! Session done 🎉 Time for a ${PHASE_LABELS[state.phase].toLowerCase()}.`
      : p.lastCompleted
        ? "Break's over ⏰ Let's get back to it."
        : null;

  const timer = (
    <Card style={styles.timerCard}>
      {doneMessage ? (
        <View style={[styles.banner, { backgroundColor: isBreak ? colors.successSoft : colors.primarySoft }]}>
          <AppText variant="label" center color={isBreak ? colors.success : colors.primary} style={styles.flex}>
            {doneMessage}
          </AppText>
          <IconButton icon="close" label="Dismiss" size={18} onPress={p.dismissCompleted} background="transparent" />
        </View>
      ) : null}
      <View style={[styles.phasePill, { backgroundColor: isBreak ? colors.successSoft : colors.primarySoft }]}>
        <Ionicons name={isBreak ? 'cafe' : 'book'} size={16} color={isBreak ? colors.success : colors.primary} />
        <AppText variant="caption" bold color={isBreak ? colors.success : colors.primary}>
          {PHASE_LABELS[state.phase]}
        </AppText>
      </View>
      <ProgressRing size={ringSize} stroke={16} progress={p.progress} color={ringColor}>
        <AppText style={[styles.clock, { color: colors.text }]} center accessibilityRole="timer">
          {formatClock(p.remainingMs)}
        </AppText>
        <AppText variant="caption" muted center>
          {state.status === 'paused' ? 'Paused' : running ? (isBreak ? 'Relax a bit' : 'Stay focused 💪') : 'Ready'}
        </AppText>
      </ProgressRing>

      <View style={styles.dots} accessibilityLabel={`Session ${cyclePos + 1} of ${s.sessionsBeforeLongBreak}`}>
        {Array.from({ length: s.sessionsBeforeLongBreak }, (_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i < filledDots ? ringColor : colors.cardAlt }]} />
        ))}
      </View>

      <View style={styles.controls}>
        {idle ? (
          <Button
            title={isBreak ? 'Start break' : 'Start focus'}
            icon="play"
            onPress={p.start}
            color={isBreak ? colors.success : undefined}
            style={styles.mainBtn}
          />
        ) : running ? (
          <Button title="Pause" icon="pause" onPress={p.pause} style={styles.mainBtn} />
        ) : (
          <Button title="Resume" icon="play" onPress={p.resume} style={styles.mainBtn} />
        )}
      </View>
      <View style={styles.controls}>
        <Button title={isBreak ? 'Skip break' : 'Skip'} icon="play-skip-forward" variant="secondary" small onPress={p.skip} />
        {!idle || state.completedWork > 0 ? (
          <Button title="Finish" icon="stop" variant="danger" small onPress={p.finish} />
        ) : null}
      </View>
    </Card>
  );

  const side = (
    <>
      <Section title="What are you studying?">
        {subjects.length === 0 ? (
          <Card>
            <AppText variant="caption" muted>
              Add your subjects to track study time per subject.
            </AppText>
            <Button title="Add subject" icon="add" small variant="secondary" onPress={() => router.push('/subject-form')} style={styles.topGap} />
          </Card>
        ) : (
          <SubjectPicker subjects={subjects} value={state.subjectId} onChange={p.setSubject} allowNone noneLabel="No subject" />
        )}
        {!idle && state.phase === 'work' ? (
          <AppText variant="caption" muted>
            If you change the subject now, the current session will count toward the new one.
          </AppText>
        ) : null}
      </Section>

      <Section title={`Today: ${formatDuration(studiedToday)}`}>
        {todaySessions.length === 0 ? (
          <AppText variant="caption" muted>
            No sessions yet today. The first one is the hardest. Just start 😉
          </AppText>
        ) : (
          todaySessions.map((x) => (
            <View key={x.id} style={[styles.sessionRow, { borderColor: colors.border }]}>
              <SubjectTag subject={x.subjectId ? subjectMap.get(x.subjectId) : null} fallback="No subject" />
              <AppText variant="caption" muted style={styles.flex}>
                {formatTime(minutesToTime(minutesOfDay(new Date(x.startedAt))))}
              </AppText>
              <AppText variant="caption" bold>
                {formatDuration(x.minutes)}
              </AppText>
            </View>
          ))
        )}
      </Section>

      <Card onPress={() => router.push('/settings')}>
        <View style={styles.settingsRow}>
          <Ionicons name="options-outline" size={22} color={colors.primary} />
          <View style={styles.flex}>
            <AppText variant="label">Durations</AppText>
            <AppText variant="caption" muted>
              Focus {s.workMinutes} min • break {s.shortBreakMinutes} min • long break {s.longBreakMinutes} min every {s.sessionsBeforeLongBreak} sessions
            </AppText>
          </View>
          <AppText variant="caption" bold color={colors.primary}>
            Edit
          </AppText>
        </View>
      </Card>
    </>
  );

  return (
    <Screen title="Study timer" subtitle="Pomodoro: focus, then take short breaks">
      <Columns wide={isWide}>
        {timer}
        {side}
      </Columns>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  timerCard: { alignItems: 'center', gap: 18, paddingVertical: 24 },
  banner: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  phasePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  clock: { fontSize: 60, fontWeight: '800', lineHeight: 70, fontVariant: ['tabular-nums'], writingDirection: 'ltr' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  controls: { flexDirection: 'row', gap: 10, justifyContent: 'center', alignSelf: 'stretch' },
  mainBtn: { flex: 1, maxWidth: 320 },
  topGap: { marginTop: 10, alignSelf: 'flex-start' },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
