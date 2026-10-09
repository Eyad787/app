import { closeForm } from '@/lib/navigation';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { DatePickerModal } from '@/components/DatePickerModal';
import { Field, PickerButton, SubjectPicker, TextField } from '@/components/forms';
import { FormScreen } from '@/components/FormScreen';
import { PRIORITY_LABELS } from '@/constants/labels';
import { useToday } from '@/hooks/useNow';
import { useColors } from '@/hooks/useTheme';
import { confirmAsync } from '@/lib/confirm';
import { useData, useSubjects } from '@/lib/db/DataProvider';
import { addDays, formatDayDate, isValidDateKey } from '@/lib/logic/dates';
import type { DateKey, Priority } from '@/lib/types';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export default function TaskForm() {
  const params = useLocalSearchParams<{ id?: string; due?: string; subjectId?: string }>();
  const colors = useColors();
  const today = useToday();
  const { data, addTask, updateTask, deleteTask } = useData();
  const subjects = useSubjects();
  const existing = params.id ? data.tasks.find((t) => t.id === params.id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [subjectId, setSubjectId] = useState<string | null>(existing ? existing.subjectId : (params.subjectId ?? null));
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'medium');
  const [due, setDue] = useState<DateKey | null>(existing ? existing.due : isValidDateKey(params.due) ? params.due : null);
  const [picking, setPicking] = useState(false);
  const [touched, setTouched] = useState(false);

  const save = () => {
    setTouched(true);
    if (!title.trim()) return;
    const input = { title: title.trim(), subjectId, priority, due };
    if (existing) updateTask(existing.id, input);
    else addTask(input);
    closeForm();
  };

  const remove = async () => {
    if (!existing) return;
    const ok = await confirmAsync({ title: 'Delete task', message: 'Are you sure you want to delete this task?', confirmText: 'Delete' });
    if (!ok) return;
    deleteTask(existing.id);
    closeForm();
  };

  const priorityColor = { high: colors.danger, medium: colors.warning, low: colors.success };

  return (
    <FormScreen title={existing ? 'Edit task' : 'New task'} onSave={save} onDelete={existing ? remove : undefined}>
      <Field label="Task" error={touched && !title.trim() ? 'Write the task' : null}>
        <TextField
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Solve physics sheet 3"
          autoFocus={!existing}
          maxLength={200}
          returnKeyType="done"
          onSubmitEditing={save}
        />
      </Field>
      <Field label="Subject">
        <SubjectPicker subjects={subjects} value={subjectId} onChange={setSubjectId} allowNone noneLabel="General" />
      </Field>
      <Field label="Priority">
        <View style={styles.wrap}>
          {PRIORITIES.map((p) => (
            <Chip key={p} label={PRIORITY_LABELS[p]} color={priorityColor[p]} selected={priority === p} onPress={() => setPriority(p)} />
          ))}
        </View>
      </Field>
      <Field label="Due date" hint="Optional">
        <PickerButton
          icon="calendar-outline"
          value={due ? formatDayDate(due) : null}
          placeholder="No due date"
          onPress={() => setPicking(true)}
          onClear={() => setDue(null)}
        />
        <View style={styles.wrap}>
          <Chip label="Today" selected={due === today} onPress={() => setDue(today)} />
          <Chip label="Tomorrow" selected={due === addDays(today, 1)} onPress={() => setDue(addDays(today, 1))} />
          <Chip label="No due date" selected={due == null} onPress={() => setDue(null)} />
        </View>
      </Field>
      <DatePickerModal visible={picking} value={due} today={today} onSelect={setDue} onClose={() => setPicking(false)} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
