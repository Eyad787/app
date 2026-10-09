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

  const error = touched && !name.trim() ? 'اكتب اسم المادة' : null;

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
      title: 'حذف المادة',
      message: `هيتمسح "${existing.name}" ومواعيدها في الجدول وامتحاناتها. المهام ووقت المذاكرة هيفضلوا بس من غير مادة.`,
      confirmText: 'احذف',
    });
    if (!ok) return;
    deleteSubject(existing.id);
    router.dismissTo('/subjects');
  };

  return (
    <FormScreen title={existing ? 'تعديل المادة' : 'مادة جديدة'} onSave={save} onDelete={existing ? remove : undefined}>
      <Field label="اسم المادة" error={error}>
        <TextField value={name} onChangeText={setName} placeholder="مثلاً: رياضيات 2" autoFocus={!existing} returnKeyType="done" maxLength={80} />
      </Field>
      <Field label="اسم الدكتور" hint="اختياري">
        <TextField value={instructor} onChangeText={setInstructor} placeholder="د. ..." maxLength={80} />
      </Field>
      <Field label="الساعات المعتمدة">
        <Stepper value={hours} onChange={setHours} min={0} max={12} suffix="ساعات" />
      </Field>
      <Field label="لون المادة">
        <ColorPicker value={color} onChange={setColor} />
      </Field>
      <View style={[styles.preview, { backgroundColor: color }]}>
        <AppText variant="heading" color="#FFFFFF" numberOfLines={1}>
          {name.trim() || 'اسم المادة'}
        </AppText>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  preview: { borderRadius: 16, padding: 16 },
});
