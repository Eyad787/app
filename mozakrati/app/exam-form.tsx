import { closeForm } from '@/lib/navigation';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { DatePickerModal } from '@/components/DatePickerModal';
import { Field, PickerButton, SubjectPicker, TextField } from '@/components/forms';
import { FormScreen } from '@/components/FormScreen';
import { TimePickerModal } from '@/components/TimePickerModal';
import { EXAM_KIND_LABELS } from '@/constants/labels';
import { useToday } from '@/hooks/useNow';
import { confirmAsync } from '@/lib/confirm';
import { useData, useSubjects } from '@/lib/db/DataProvider';
import { addDays, formatDayDate, formatTime } from '@/lib/logic/dates';
import { isSubmission } from '@/lib/logic/exams';
import type { DateKey, ExamKind, TimeHM } from '@/lib/types';

const KINDS: ExamKind[] = ['quiz', 'midterm', 'final', 'practical', 'oral', 'assignment', 'project'];

export default function ExamForm() {
  const params = useLocalSearchParams<{ id?: string; subjectId?: string }>();
  const today = useToday();
  const { data, addExam, updateExam, deleteExam } = useData();
  const subjects = useSubjects();
  const existing = params.id ? data.exams.find((e) => e.id === params.id) : undefined;

  const [subjectId, setSubjectId] = useState<string | null>(existing ? existing.subjectId : (params.subjectId ?? subjects[0]?.id ?? null));
  const [kind, setKind] = useState<ExamKind>(existing?.kind ?? 'quiz');
  const [date, setDate] = useState<DateKey>(existing?.date ?? addDays(today, 7));
  const [time, setTime] = useState<TimeHM | null>(existing?.time ?? null);
  const [location, setLocation] = useState(existing?.location ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);

  const submission = isSubmission(kind);

  const save = () => {
    const input = { subjectId, kind, date, time, location: location.trim(), notes: notes.trim() };
    if (existing) updateExam(existing.id, input);
    else addExam(input);
    closeForm();
  };

  const remove = async () => {
    if (!existing) return;
    const ok = await confirmAsync({ title: 'Delete', message: 'Are you sure you want to delete this?', confirmText: 'Delete' });
    if (!ok) return;
    deleteExam(existing.id);
    closeForm();
  };

  return (
    <FormScreen title={existing ? 'Edit' : 'New exam or deadline'} onSave={save} onDelete={existing ? remove : undefined}>
      <Field label="Type">
        <View style={styles.wrap}>
          {KINDS.map((k) => (
            <Chip key={k} label={EXAM_KIND_LABELS[k]} selected={kind === k} onPress={() => setKind(k)} />
          ))}
        </View>
      </Field>
      <Field label="Subject">
        <SubjectPicker subjects={subjects} value={subjectId} onChange={setSubjectId} allowNone noneLabel="No subject" />
      </Field>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label={submission ? 'Due date' : 'Date'}>
            <PickerButton icon="calendar-outline" value={formatDayDate(date, true)} placeholder="" onPress={() => setPicker('date')} />
          </Field>
        </View>
      </View>
      <Field label="Time" hint="Optional">
        <PickerButton
          icon="time-outline"
          value={time ? formatTime(time) : null}
          placeholder="Set a time"
          onPress={() => setPicker('time')}
          onClear={() => setTime(null)}
        />
      </Field>
      <Field label={submission ? 'Submit where?' : 'Location'} hint="Optional">
        <TextField value={location} onChangeText={setLocation} placeholder={submission ? 'e.g. On the LMS or to the TA' : 'e.g. Hall 5'} maxLength={80} />
      </Field>
      <Field label="Notes" hint="e.g. what's included, or what to submit">
        <TextField value={notes} onChangeText={setNotes} placeholder="Lectures 1 to 5..." multiline maxLength={2000} />
      </Field>
      <DatePickerModal visible={picker === 'date'} value={date} today={today} onSelect={setDate} onClose={() => setPicker(null)} />
      <TimePickerModal visible={picker === 'time'} value={time} onSelect={setTime} onClose={() => setPicker(null)} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
