import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ClassCard } from '@/components/ClassCard';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { WeekGrid } from '@/components/WeekGrid';
import { WEEK_ORDER, WEEKDAY_NAMES, WEEKDAY_SHORT } from '@/constants/labels';
import { useNow } from '@/hooks/useNow';
import { useResponsive } from '@/hooks/useResponsive';
import { useColors } from '@/hooks/useTheme';
import { useData, useSubjectMap, useSubjects } from '@/lib/db/DataProvider';
import { countWord, minutesOfDay, timeToMinutes } from '@/lib/logic/dates';
import { classesForDay, currentAndNext } from '@/lib/logic/schedule';
import { isRTL } from '@/lib/rtl';
import type { ClassSession, Weekday } from '@/lib/types';

export default function ScheduleScreen() {
  const colors = useColors();
  const { isWide } = useResponsive();
  const now = useNow();
  const { data } = useData();
  const subjects = useSubjects();
  const subjectMap = useSubjectMap();
  const todayWd = now.getDay() as Weekday;

  const subjectIds = useMemo(() => new Set(subjects.map((s) => s.id)), [subjects]);
  const classes = useMemo(() => data.classes.filter((c) => subjectIds.has(c.subjectId)), [data.classes, subjectIds]);

  // الجمعة بتظهر لو مفعّلة من الإعدادات أو لو فيها حصص
  const days = useMemo(
    () => WEEK_ORDER.filter((d) => d !== 5 || data.settings.showFriday || classes.some((c) => c.day === 5)),
    [data.settings.showFriday, classes],
  );
  const [selected, setSelected] = useState<Weekday>(() => (days.includes(todayWd) ? todayWd : days[0]));
  const day = days.includes(selected) ? selected : days[0];

  // السحب يمين وشمال للتنقل بين الأيام
  const dayRef = useRef(day);
  dayRef.current = day;
  const daysRef = useRef(days);
  daysRef.current = days;
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) < 60) return;
          // في RTL اليوم الجاي على الشمال، فالسحب ناحية اليمين يجيبه
          const forward = isRTL ? g.dx > 0 : g.dx < 0;
          const list = daysRef.current;
          const i = list.indexOf(dayRef.current);
          const next = list[Math.min(list.length - 1, Math.max(0, i + (forward ? 1 : -1)))];
          setSelected(next);
        },
      }),
    [],
  );

  const openClass = (c: ClassSession) => router.push({ pathname: '/class-form', params: { id: c.id } });
  const addClass = (d: Weekday = day) => router.push({ pathname: '/class-form', params: { day: String(d) } });

  if (subjects.length === 0) {
    return (
      <Screen title="Schedule">
        <EmptyState
          icon="book-outline"
          title="Add your subjects first"
          message="To build your schedule, first add the subjects you're taking this term."
          actionLabel="Add subject"
          onAction={() => router.push('/subject-form')}
        />
      </Screen>
    );
  }

  if (isWide) {
    return (
      <Screen title="Schedule" subtitle="Click a day to add a class to it" onAdd={() => addClass(todayWd)} addLabel="Add class">
        {classes.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Your schedule is empty"
            message="Add your lectures, sections and labs with their times and locations."
            actionLabel="Add your first class"
            onAction={() => addClass(days.includes(todayWd) ? todayWd : days[0])}
          />
        ) : (
          <WeekGrid
            days={days}
            classes={classes}
            subjects={subjectMap}
            todayWeekday={todayWd}
            nowMinutes={minutesOfDay(now)}
            onPressClass={openClass}
            onPressDay={addClass}
          />
        )}
      </Screen>
    );
  }

  const dayClasses = classesForDay(classes, day);
  const nowMin = minutesOfDay(now);
  const { currentId, nextId } = day === todayWd ? currentAndNext(dayClasses, nowMin) : { currentId: null, nextId: null };

  return (
    <Screen
      title="Schedule"
      subtitle="Swipe left or right to change the day"
      onAdd={() => addClass()}
      addLabel="Add class"
      scroll={false}
      toolbar={
        <View style={styles.days}>
          {days.map((d) => {
            const active = d === day;
            const count = classes.filter((c) => c.day === d).length;
            return (
              <Pressable
                key={d}
                onPress={() => setSelected(d)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={WEEKDAY_NAMES[d]}
                style={[styles.dayBtn, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}
              >
                <AppText variant="tiny" center color={active ? colors.onPrimary : colors.text}>
                  {WEEKDAY_SHORT[d]}
                </AppText>
                <View style={styles.dotRow}>
                  {d === todayWd ? <View style={[styles.dot, { backgroundColor: active ? colors.onPrimary : colors.primary }]} /> : null}
                  <AppText variant="tiny" center color={active ? colors.onPrimary : colors.textMuted}>
                    {count || '–'}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      }
    >
      <View style={styles.flex} {...pan.panHandlers}>
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <AppText variant="heading">{WEEKDAY_NAMES[day]}</AppText>
          {dayClasses.length === 0 ? (
            <Card>
              <EmptyState
                compact
                icon="cafe-outline"
                title={`No classes on ${WEEKDAY_NAMES[day]}`}
                message={classes.length === 0 ? 'Start by adding your first lecture or section.' : 'A day off? Or something missing?'}
                actionLabel="Add class"
                onAction={() => addClass()}
              />
            </Card>
          ) : (
            dayClasses.map((c) => (
              <ClassCard
                key={c.id}
                item={c}
                subject={subjectMap.get(c.subjectId)}
                status={
                  c.id === currentId
                    ? 'current'
                    : c.id === nextId
                      ? 'next'
                      : day === todayWd && timeToMinutes(c.end) <= nowMin
                        ? 'past'
                        : null
                }
                onPress={() => openClass(c)}
              />
            ))
          )}
          <View style={[styles.hint, { borderColor: colors.border }]}>
            <AppText variant="caption" muted center>
              {countWord(days.length, 'study day')} • {countWord(classes.length, 'class', 'classes')} a week
            </AppText>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  days: { flexDirection: 'row', gap: 6 },
  dayBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 6, alignItems: 'center', gap: 2 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  list: { gap: 10, paddingBottom: 110 },
  hint: { borderTopWidth: 1, paddingTop: 12, marginTop: 6 },
});
