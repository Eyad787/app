import { closeForm } from '@/lib/navigation';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Field, PickerButton, SubjectPicker, TextField } from '@/components/forms';
import { FormScreen } from '@/components/FormScreen';
import { TimePickerModal } from '@/components/TimePickerModal';
import { CLASS_KIND_LABELS, WEEK_ORDER, WEEKDAY_NAMES } from '@/constants/labels';
import { useColors } from '@/hooks/useTheme';
import { confirmAsync } from '@/lib/confirm';
import { useData, useSubjects } from '@/lib/db/DataProvider';
import { formatTime, minutesToTime, timeToMinutes } from '@/lib/logic/dates';
import { findConflicts, isValidRange } from '@/lib/logic/schedule';
import type { ClassKind, TimeHM, Weekday } from '@/lib/types';

const KINDS: ClassKind[] = ['lecture', 'section', 'lab'];

export default function ClassForm() {
  const params = useLocalSearchParams<{ id?: string; day?: string; subjectId?: string }>();
  const colors = useColors();
  const { data, addClass, updateClass, deleteClass } = useData();
  const subjects = useSubjects();
  const existing = params.id ? data.classes.find((c) => c.id === params.id) : undefined;

  const initialDay = (() => {
    const d = Number(params.day);
    return Number.isInteger(d) && d >= 0 && d <= 6 ? (d as Weekday) : (new Date().getDay() as Weekday);
  })();

  const [subjectId, setSubjectId] = useState<string | null>(existing?.subjectId ?? params.subjectId ?? subjects[0]?.id ?? null);
  const [kind, setKind] = useState<ClassKind>(existing?.kind ?? 'lecture');
  const [day, setDay] = useState<Weekday>(existing?.day ?? initialDay);
  const [start, setStart] = useState<TimeHM>(existing?.start ?? '09:00');
  const [end, setEnd] = useState<TimeHM>(existing?.end ?? '10:30');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [instructor, setInstructor] = useState(existing?.instructor ?? '');
  const [picking, setPicking] = useState<'start' | 'end' | null>(null);

  if (subjects.length === 0) {
    return (
      <FormScreen title="حصة جديدة" onSave={closeForm} canSave={false}>
        <EmptyState
          icon="book-outline"
          title="ضيف مادة الأول"
          message="كل حصة في الجدول لازم تبقى تبع مادة."
          actionLabel="أضف مادة"
          onAction={() => router.replace('/subject-form')}
        />
      </FormScreen>
    );
  }

  const rangeOk = isValidRange(start, end);
  const conflicts = rangeOk ? findConflicts(data.classes, { id: existing?.id, day, start, end }) : [];
  const subjectName = (id: string) => data.subjects.find((s) => s.id === id)?.name ?? '';

  const save = () => {
    if (!subjectId || !rangeOk) return;
    const input = { subjectId, kind, day, start, end, location: location.trim(), instructor: instructor.trim() };
    if (existing) updateClass(existing.id, input);
    else addClass(input);
    closeForm();
  };

  const remove = async () => {
    if (!existing) return;
    const ok = await confirmAsync({ title: 'حذف الحصة', message: 'متأكد إنك عايز تشيل الحصة دي من الجدول؟', confirmText: 'احذف' });
    if (!ok) return;
    deleteClass(existing.id);
    closeForm();
  };

  const setStartKeepLength = (t: TimeHM) => {
    const length = Math.max(30, timeToMinutes(end) - timeToMinutes(start));
    setStart(t);
    setEnd(minutesToTime(timeToMinutes(t) + length));
  };

  return (
    <FormScreen title={existing ? 'تعديل الحصة' : 'حصة جديدة'} onSave={save} canSave={!!subjectId && rangeOk} onDelete={existing ? remove : undefined}>
      <Field label="المادة">
        <SubjectPicker subjects={subjects} value={subjectId} onChange={setSubjectId} />
      </Field>
      <Field label="النوع">
        <View style={styles.wrap}>
          {KINDS.map((k) => (
            <Chip key={k} label={CLASS_KIND_LABELS[k]} selected={kind === k} onPress={() => setKind(k)} />
          ))}
        </View>
      </Field>
      <Field label="اليوم">
        <View style={styles.wrap}>
          {WEEK_ORDER.map((d) => (
            <Chip key={d} label={WEEKDAY_NAMES[d]} selected={day === d} onPress={() => setDay(d)} />
          ))}
        </View>
      </Field>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field label="من">
            <PickerButton icon="time-outline" value={formatTime(start)} placeholder="" onPress={() => setPicking('start')} />
          </Field>
        </View>
        <View style={styles.flex}>
          <Field label="لحد">
            <PickerButton icon="time-outline" value={formatTime(end)} placeholder="" onPress={() => setPicking('end')} />
          </Field>
        </View>
      </View>
      {!rangeOk ? (
        <AppText variant="caption" color={colors.danger}>
          وقت النهاية لازم يبقى بعد وقت البداية.
        </AppText>
      ) : conflicts.length > 0 ? (
        <AppText variant="caption" color={colors.warning}>
          ⚠️ الميعاد ده متعارض مع: {conflicts.map((c) => `${subjectName(c.subjectId)} (${formatTime(c.start)})`).join('، ')}
        </AppText>
      ) : null}
      <Field label="المكان" hint="اختياري – مثلاً: مدرج 3 أو معمل B">
        <TextField value={location} onChangeText={setLocation} placeholder="المدرج / القاعة" maxLength={80} />
      </Field>
      <Field label={kind === 'lecture' ? 'الدكتور' : 'المعيد'} hint="اختياري">
        <TextField value={instructor} onChangeText={setInstructor} placeholder="الاسم" maxLength={80} />
      </Field>
      <TimePickerModal
        visible={picking != null}
        title={picking === 'start' ? 'بتبدأ الساعة كام؟' : 'بتخلص الساعة كام؟'}
        value={picking === 'start' ? start : end}
        onClose={() => setPicking(null)}
        onSelect={(t) => (picking === 'start' ? setStartKeepLength(t) : setEnd(t))}
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
