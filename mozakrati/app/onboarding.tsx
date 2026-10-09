import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { ColorPicker, Field, Stepper, TextField } from '@/components/forms';
import { SUBJECT_COLORS } from '@/constants/colors';
import { APP_NAME, GRADING_LABELS, TERM_OPTIONS, YEAR_OPTIONS } from '@/constants/labels';
import { useColors } from '@/hooks/useTheme';
import { useData, useSubjects } from '@/lib/db/DataProvider';
import type { GradingSystem } from '@/lib/types';

const STEPS = 4;

export default function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, updateProfile, addSubject, deleteSubject } = useData();
  const subjects = useSubjects();
  const [step, setStep] = useState(0);
  const p = data.profile;

  // بيانات المادة الجديدة
  const [subjectName, setSubjectName] = useState('');
  const [hours, setHours] = useState(3);
  const [color, setColor] = useState<string>(SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length]);

  const finish = () => {
    updateProfile({ onboardingDone: true });
    router.replace('/');
  };
  const next = () => (step < STEPS - 1 ? setStep(step + 1) : finish());

  const addQuickSubject = () => {
    if (!subjectName.trim()) return;
    addSubject({ name: subjectName, color, creditHours: hours });
    setSubjectName('');
    setColor(SUBJECT_COLORS[(subjects.length + 1) % SUBJECT_COLORS.length]);
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i <= step ? colors.primary : colors.border, flex: i === step ? 2 : 1 }]} />
          ))}
        </View>
        <Pressable onPress={finish} hitSlop={10} accessibilityRole="button">
          <AppText variant="caption" bold color={colors.textMuted}>
            Skip for now
          </AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          {step === 0 ? (
            <>
              <View style={[styles.logo, { backgroundColor: colors.primary }]}>
                <Ionicons name="school" size={56} color={colors.onPrimary} />
              </View>
              <AppText variant="display" center>
                Welcome to {APP_NAME} 👋
              </AppText>
              <AppText muted center>
                Let's organize your lectures, exams and tasks, and study with a Pomodoro timer. All your data stays on your device.
              </AppText>
              <Field label="What's your name?">
                <TextField value={p.name} onChangeText={(name) => updateProfile({ name })} placeholder="Your name" maxLength={60} returnKeyType="next" onSubmitEditing={next} />
              </Field>
            </>
          ) : step === 1 ? (
            <>
              <AppText variant="title">Where do you study? 🎓</AppText>
              <Field label="Faculty / university">
                <TextField value={p.faculty} onChangeText={(faculty) => updateProfile({ faculty })} placeholder="e.g. Faculty of Commerce, Ain Shams" maxLength={80} />
              </Field>
              <Field label="Year">
                <View style={styles.wrap}>
                  {YEAR_OPTIONS.map((y) => (
                    <Chip key={y} label={y} selected={p.year === y} onPress={() => updateProfile({ year: y })} />
                  ))}
                </View>
              </Field>
              <Field label="Current term">
                <View style={styles.wrap}>
                  {TERM_OPTIONS.map((t) => (
                    <Chip key={t} label={t} selected={p.term === t} onPress={() => updateProfile({ term: t })} />
                  ))}
                </View>
              </Field>
            </>
          ) : step === 2 ? (
            <>
              <AppText variant="title">What grading system do you use?</AppText>
              <AppText muted>This is used by the GPA calculator. You can change it later in Settings.</AppText>
              {(Object.keys(GRADING_LABELS) as GradingSystem[]).map((g) => {
                const active = p.gradingSystem === g;
                return (
                  <Card key={g} onPress={() => updateProfile({ gradingSystem: g })} style={active ? { borderColor: colors.primary, borderWidth: 2 } : undefined}>
                    <View style={styles.option}>
                      <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={24} color={active ? colors.primary : colors.textMuted} />
                      <View style={styles.flex}>
                        <AppText variant="heading">{GRADING_LABELS[g].title}</AppText>
                        <AppText variant="caption" muted>
                          {GRADING_LABELS[g].hint}
                        </AppText>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </>
          ) : (
            <>
              <AppText variant="title">Quickly add your subjects 📚</AppText>
              <AppText muted>Name, credit hours and a color. You can fill in the rest later.</AppText>
              <Card style={styles.gap}>
                <TextField value={subjectName} onChangeText={setSubjectName} placeholder="Subject name" maxLength={80} returnKeyType="done" onSubmitEditing={addQuickSubject} />
                <Stepper value={hours} onChange={setHours} min={0} max={12} suffix="credit hrs" />
                <ColorPicker value={color} onChange={setColor} />
                <Button title="Add subject" icon="add" variant="secondary" onPress={addQuickSubject} disabled={!subjectName.trim()} />
              </Card>
              {subjects.map((s) => (
                <View key={s.id} style={[styles.subjectRow, { backgroundColor: s.color }]}>
                  <AppText variant="label" bold color="#FFFFFF" style={styles.flex}>
                    {s.name}
                  </AppText>
                  <AppText variant="caption" color="#FFFFFF">
                    {s.creditHours} cr
                  </AppText>
                  <Pressable onPress={() => deleteSubject(s.id)} hitSlop={10} accessibilityLabel={`Remove ${s.name}`}>
                    <Ionicons name="close-circle" size={22} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16), borderTopColor: colors.border }]}>
        <View style={[styles.inner, styles.row]}>
          {step > 0 ? <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} /> : null}
          <Button
            title={step === STEPS - 1 ? "Let's go 🚀" : step === 0 && !p.name.trim() ? 'Continue without a name' : 'Next'}
            onPress={next}
            style={styles.flex}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, maxWidth: 640, width: '100%', alignSelf: 'center' },
  dots: { flex: 1, flexDirection: 'row', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  content: { padding: 20, paddingBottom: 40 },
  inner: { width: '100%', maxWidth: 600, alignSelf: 'center', gap: 18 },
  logo: { width: 104, height: 104, borderRadius: 32, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 20 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gap: { gap: 14 },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12 },
  footer: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 10 },
});
