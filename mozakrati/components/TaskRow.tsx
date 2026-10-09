import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';

import { PRIORITY_LABELS } from '@/constants/labels';
import { useColors } from '@/hooks/useTheme';
import { countdownLabel } from '@/lib/logic/countdown';
import { isOverdue } from '@/lib/logic/tasks';
import type { DateKey, Task, Subject } from '@/lib/types';

import { AppText } from './AppText';
import { Checkbox } from './Checkbox';
import { SubjectTag } from './SubjectTag';

type Props = { task: Task; subject: Subject | undefined; today: DateKey; onToggle: () => void; onPress?: () => void };

export function TaskRow({ task, subject, today, onToggle, onPress }: Props) {
  const colors = useColors();
  const fade = useRef(new Animated.Value(task.done ? 0.6 : 1)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: task.done ? 0.6 : 1, duration: 250, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [task.done, fade]);

  const priorityColor = { high: colors.danger, medium: colors.warning, low: colors.success }[task.priority];
  const overdue = isOverdue(task, today);

  return (
    <Animated.View style={{ opacity: fade }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
      >
        <Checkbox checked={task.done} onToggle={onToggle} color={subject?.color} label={task.title} />
        <View style={styles.body}>
          <AppText
            variant="label"
            numberOfLines={2}
            style={task.done ? { textDecorationLine: 'line-through', color: colors.textMuted } : undefined}
          >
            {task.title}
          </AppText>
          <View style={styles.meta}>
            <SubjectTag subject={subject} />
            {task.due ? (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={13} color={overdue ? colors.danger : colors.textMuted} />
                <AppText variant="tiny" color={overdue ? colors.danger : colors.textMuted}>
                  {overdue ? `Overdue (${countdownLabel(task.due, today).replace(' ago', '').replace('Yesterday', '1 day')})` : countdownLabel(task.due, today)}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
        <View style={[styles.priority, { backgroundColor: priorityColor }]} accessibilityLabel={`${PRIORITY_LABELS[task.priority]} priority`} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  body: { flex: 1, gap: 5, minWidth: 0 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  priority: { width: 8, height: 8, borderRadius: 4 },
});
