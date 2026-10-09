import { closeForm } from '@/lib/navigation';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { ColorPicker, Field, Stepper, TextField } from '@/components/forms';
import { FormScreen } from '@/components/FormScreen';
import { SUBJECT_COLORS } from '@/constants/colors';
import { confirmAsync } from '@/lib/confirm';
import { useData, useSubjects } from '@/lib/db/DataProvider';

export default function SubjectForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, addSubject, updateSubject, deleteSubject } = useData();
  const subjects = useSubjects();
  const existing = id ? data.subjects.find((s) => s.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [instructor, setInstructor] = useState(existing?.instructor ?? '');
  const [hours, setHours] = useState(existing?.creditHours ?? 3);
  const [color, setColor] = useState<string>(existing?.color ?? SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length]);
  const [touched, setTouched] = useState(false);

  const error = touched && !name.trim() ? 'Enter the subject name' : null;

  const save = () => {
    setTouched(true);
    if (!name.trim()) return;
    const input = { name: name.trim(), instructor: instructor.trim(), creditHours: hours, color };
    if (existing) updateSubject(existing.id, input);
    else addSubject(input);
    closeForm();
  };

  const remove = async () => {
    if (!existing) return;
    const ok = await confirmAsync({
      title: 'Delete subject',
      message: `"${existing.name}" will be deleted along with its classes and exams. Its tasks and study time will be kept without a subject.`,
      confirmText: 'Delete',
    });
    if (!ok) return;
    deleteSubject(existing.id);
    router.dismissTo('/subjects');
  };

  return (
    <FormScreen title={existing ? 'Edit subject' : 'New subject'} onSave={save} onDelete={existing ? remove : undefined}>
      <Field label="Subject name" error={error}>
        <TextField value={name} onChangeText={setName} placeholder="e.g. Math 2" autoFocus={!existing} returnKeyType="done" maxLength={80} />
      </Field>
      <Field label="Professor" hint="Optional">
        <TextField value={instructor} onChangeText={setInstructor} placeholder="Dr. ..." maxLength={80} />
      </Field>
      <Field label="Credit hours">
        <Stepper value={hours} onChange={setHours} min={0} max={12} suffix="hrs" />
      </Field>
      <Field label="Color">
        <ColorPicker value={color} onChange={setColor} />
      </Field>
      <View style={[styles.preview, { backgroundColor: color }]}>
        <AppText variant="heading" color="#FFFFFF" numberOfLines={1}>
          {name.trim() || 'Subject name'}
        </AppText>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  preview: { borderRadius: 16, padding: 16 },
});
