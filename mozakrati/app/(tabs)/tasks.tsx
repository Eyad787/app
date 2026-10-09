import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Grid } from '@/components/Grid';
import { Screen } from '@/components/Screen';
import { TaskRow } from '@/components/TaskRow';
import { useToday } from '@/hooks/useNow';
import { useResponsive } from '@/hooks/useResponsive';
import { useTaskToggle } from '@/hooks/useTaskToggle';
import { useColors } from '@/hooks/useTheme';
import { useData, useSubjectMap, useSubjects } from '@/lib/db/DataProvider';
import { filterTasks, type TaskFilter } from '@/lib/logic/tasks';
import { isRTL } from '@/lib/rtl';

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'كل المهام' },
  { value: 'today', label: 'النهارده' },
  { value: 'week', label: 'الأسبوع ده' },
  { value: 'subject', label: 'حسب المادة' },
  { value: 'done', label: 'المكتملة' },
];

const EMPTY: Record<TaskFilter, { title: string; message: string }> = {
  all: { title: 'مفيش مهام', message: 'اكتب أي حاجة محتاج تعملها: شيت، تلخيص، مراجعة... وعلّم عليها لما تخلص.' },
  today: { title: 'مفيش مهام النهارده 🎉', message: 'مفيش حاجة تسليمها النهارده أو متأخرة.' },
  week: { title: 'الأسبوع ده فاضي', message: 'مفيش مهام ميعادها الأسبوع ده.' },
  subject: { title: 'مفيش مهام للمادة دي', message: 'ضيف مهمة واربطها بالمادة.' },
  done: { title: 'لسه ماخلصتش مهام', message: 'المهام اللي هتخلصها هتظهر هنا.' },
};

export default function TasksScreen() {
  const colors = useColors();
  const today = useToday();
  const { columns } = useResponsive();
  const { data, addTask } = useData();
  const { toggle, tasksForFilter, real } = useTaskToggle();
  const subjects = useSubjects();
  const subjectMap = useSubjectMap();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [subjectId, setSubjectId] = useState<string | null>(subjects[0]?.id ?? null);
  const [quick, setQuick] = useState('');

  const activeSubject = subjects.some((s) => s.id === subjectId) ? subjectId : (subjects[0]?.id ?? null);
  const list = filterTasks(filter === 'done' ? data.tasks : tasksForFilter, filter, today, activeSubject).map(real);
  const pendingCount = data.tasks.filter((t) => !t.done).length;

  const quickAdd = () => {
    if (!quick.trim()) return;
    addTask({
      title: quick,
      subjectId: filter === 'subject' ? activeSubject : null,
      priority: 'medium',
      due: filter === 'today' ? today : null,
    });
    setQuick('');
  };

  const newTaskParams = filter === 'today' ? { due: today } : filter === 'subject' && activeSubject ? { subjectId: activeSubject } : {};

  return (
    <Screen
      title="المهام"
      subtitle={pendingCount ? `${pendingCount} لسه ماخلصتش` : undefined}
      onAdd={() => router.push({ pathname: '/task-form', params: newTaskParams })}
      addLabel="أضف مهمة"
      toolbar={
        <View style={styles.toolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {FILTERS.map((f) => (
              <Chip key={f.value} label={f.label} selected={filter === f.value} onPress={() => setFilter(f.value)} />
            ))}
          </ScrollView>
          {filter === 'subject' && subjects.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {subjects.map((s) => (
                <Chip key={s.id} label={s.name} color={s.color} selected={activeSubject === s.id} onPress={() => setSubjectId(s.id)} />
              ))}
            </ScrollView>
          ) : null}
          {filter !== 'done' ? (
            <View style={[styles.quick, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                value={quick}
                onChangeText={setQuick}
                onSubmitEditing={quickAdd}
                placeholder="إضافة سريعة: اكتب المهمة ودوس Enter"
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                blurOnSubmit={false}
                style={[styles.quickInput, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
                maxLength={200}
              />
              <Pressable onPress={quickAdd} disabled={!quick.trim()} accessibilityLabel="أضف" hitSlop={8}>
                <Ionicons name="add-circle" size={30} color={quick.trim() ? colors.primary : colors.border} />
              </Pressable>
            </View>
          ) : null}
        </View>
      }
    >
      {filter === 'subject' && subjects.length === 0 ? (
        <EmptyState icon="book-outline" title="لسه مفيش مواد" actionLabel="أضف مادة" onAction={() => router.push('/subject-form')} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={filter === 'done' ? 'trophy-outline' : 'checkbox-outline'}
          title={EMPTY[filter].title}
          message={EMPTY[filter].message}
          actionLabel={filter === 'done' ? undefined : 'أضف مهمة'}
          onAction={() => router.push({ pathname: '/task-form', params: newTaskParams })}
        />
      ) : (
        <Grid columns={Math.min(columns, 2)} gap={10}>
          {list.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              subject={t.subjectId ? subjectMap.get(t.subjectId) : undefined}
              today={today}
              onToggle={() => toggle(t)}
              onPress={() => router.push({ pathname: '/task-form', params: { id: t.id } })}
            />
          ))}
        </Grid>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: 10 },
  chips: { gap: 8, paddingVertical: 2 },
  quick: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, gap: 8 },
  quickInput: { flex: 1, minHeight: 48, fontSize: 16 },
});
