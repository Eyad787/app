import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Field, Stepper, TextField } from '@/components/forms';
import { Columns } from '@/components/Grid';
import { Screen } from '@/components/Screen';
import { Section } from '@/components/Section';
import { APP_NAME, GRADING_LABELS, TERM_OPTIONS, YEAR_OPTIONS } from '@/constants/labels';
import { useResponsive } from '@/hooks/useResponsive';
import { useColors } from '@/hooks/useTheme';
import { confirmAsync, notify } from '@/lib/confirm';
import { exportBackup, importBackup } from '@/lib/db/backup';
import { useData } from '@/lib/db/DataProvider';
import { formatDuration } from '@/lib/logic/dates';
import type { GradingSystem, PomodoroSettings } from '@/lib/types';

export default function SettingsScreen() {
  const { isWide } = useResponsive();
  const { data, updateProfile, updateSettings, replaceAll, resetAll } = useData();
  const { profile, settings } = data;
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  const setPomodoro = (patch: Partial<PomodoroSettings>) => updateSettings({ pomodoro: { ...settings.pomodoro, ...patch } });

  const doExport = async () => {
    setBusy('export');
    try {
      await exportBackup(data);
    } catch (e) {
      notify('معرفناش نصدّر', e instanceof Error ? e.message : 'حصل خطأ');
    } finally {
      setBusy(null);
    }
  };

  const doImport = async () => {
    setBusy('import');
    try {
      const imported = await importBackup();
      if (!imported) return;
      const ok = await confirmAsync({
        title: 'استيراد نسخة احتياطية',
        message: `النسخة فيها ${imported.subjects.length} مادة و ${imported.tasks.length} مهمة. البيانات الحالية هتتشال وتتبدّل بيها. نكمّل؟`,
        confirmText: 'استورد',
      });
      if (!ok) return;
      await replaceAll(imported);
      notify('تمام ✅', 'البيانات اترجعت بنجاح.');
    } catch (e) {
      notify('الملف ده مينفعش', e instanceof Error ? e.message : 'حصل خطأ');
    } finally {
      setBusy(null);
    }
  };

  const doReset = async () => {
    const first = await confirmAsync({
      title: 'مسح كل البيانات',
      message: 'هيتمسح كل حاجة: المواد والجدول والامتحانات والمهام وجلسات المذاكرة. يُفضّل تعمل نسخة احتياطية الأول.',
      confirmText: 'أيوه، امسح',
    });
    if (!first) return;
    const second = await confirmAsync({
      title: 'متأكد 100%؟',
      message: 'الخطوة دي مش هينفع ترجع فيها.',
      confirmText: 'امسح نهائياً',
    });
    if (!second) return;
    await resetAll();
    router.replace('/onboarding');
  };

  const profileSection = (
    <Section title="بياناتك">
      <Card style={styles.gap}>
        <Field label="الاسم">
          <TextField value={profile.name} onChangeText={(name) => updateProfile({ name })} placeholder="اسمك" maxLength={60} />
        </Field>
        <Field label="الكلية">
          <TextField value={profile.faculty} onChangeText={(faculty) => updateProfile({ faculty })} placeholder="مثلاً: هندسة القاهرة" maxLength={80} />
        </Field>
        <Field label="الفرقة">
          <View style={styles.wrap}>
            {YEAR_OPTIONS.map((y) => (
              <Chip key={y} label={y} selected={profile.year === y} onPress={() => updateProfile({ year: y })} />
            ))}
          </View>
        </Field>
        <Field label="الترم الحالي">
          <View style={styles.wrap}>
            {TERM_OPTIONS.map((t) => (
              <Chip key={t} label={t} selected={profile.term === t} onPress={() => updateProfile({ term: t })} />
            ))}
          </View>
        </Field>
        <Field label="نظام التقدير">
          <View style={styles.wrap}>
            {(Object.keys(GRADING_LABELS) as GradingSystem[]).map((g) => (
              <Chip key={g} label={GRADING_LABELS[g].title} selected={profile.gradingSystem === g} onPress={() => updateProfile({ gradingSystem: g })} />
            ))}
          </View>
        </Field>
      </Card>
    </Section>
  );

  const studySection = (
    <Section title="المذاكرة">
      <Card style={styles.gap}>
        <Field label="وقت جلسة المذاكرة">
          <Stepper value={settings.pomodoro.workMinutes} onChange={(v) => setPomodoro({ workMinutes: v })} min={5} max={120} step={5} suffix="دقيقة" />
        </Field>
        <Field label="الراحة القصيرة">
          <Stepper value={settings.pomodoro.shortBreakMinutes} onChange={(v) => setPomodoro({ shortBreakMinutes: v })} min={1} max={30} suffix="دقيقة" />
        </Field>
        <Field label="الراحة الطويلة">
          <Stepper value={settings.pomodoro.longBreakMinutes} onChange={(v) => setPomodoro({ longBreakMinutes: v })} min={5} max={60} step={5} suffix="دقيقة" />
        </Field>
        <Field label="الراحة الطويلة بعد كام جلسة؟">
          <Stepper value={settings.pomodoro.sessionsBeforeLongBreak} onChange={(v) => setPomodoro({ sessionsBeforeLongBreak: v })} min={2} max={8} suffix="جلسات" />
        </Field>
        <Field label="هدف المذاكرة اليومي" hint={formatDuration(settings.dailyGoalMinutes)}>
          <Stepper value={settings.dailyGoalMinutes} onChange={(v) => updateSettings({ dailyGoalMinutes: v })} min={0} max={720} step={15} suffix="دقيقة" />
        </Field>
        <Toggle label="صوت لما الجلسة تخلص" value={settings.sound} onChange={(sound) => updateSettings({ sound })} />
        <Toggle label="اهتزاز لما الجلسة تخلص" value={settings.vibration} onChange={(vibration) => updateSettings({ vibration })} />
      </Card>
    </Section>
  );

  const otherSection = (
    <>
      <Section title="الجدول والغياب">
        <Card style={styles.gap}>
          <Toggle label="إظهار يوم الجمعة في الجدول" value={settings.showFriday} onChange={(showFriday) => updateSettings({ showFriday })} />
          <Field label="حد الحرمان من الغياب" hint="هيتستخدم في متابعة الغياب (المرحلة الجاية)">
            <Stepper
              value={settings.absenceLimitPercent}
              onChange={(v) => updateSettings({ absenceLimitPercent: v })}
              min={5}
              max={50}
              step={5}
              suffix="%"
            />
          </Field>
        </Card>
      </Section>

      <Section title="نسخة احتياطية">
        <Card style={styles.gap}>
          <AppText variant="caption" muted>
            بياناتك متخزنة على الجهاز ده بس. اعمل نسخة احتياطية (ملف JSON) واحتفظ بيها، أو انقلها لجهاز تاني.
          </AppText>
          <View style={styles.row}>
            <Button title="تصدير" icon="download-outline" variant="secondary" onPress={doExport} loading={busy === 'export'} style={styles.flex} />
            <Button title="استيراد" icon="cloud-upload-outline" variant="secondary" onPress={doImport} loading={busy === 'import'} style={styles.flex} />
          </View>
        </Card>
      </Section>

      <Section title="منطقة الخطر">
        <Card style={styles.gap}>
          <Button title="مسح كل البيانات" icon="trash-outline" variant="danger" onPress={doReset} />
        </Card>
      </Section>

      <AppText variant="caption" muted center>
        {APP_NAME} • نسخة {Constants.expoConfig?.version ?? '1.0.0'}
      </AppText>
    </>
  );

  return (
    <Screen title="الإعدادات">
      <Columns wide={isWide}>
        <>
          {profileSection}
          {studySection}
        </>
        {otherSection}
      </Columns>
    </Screen>
  );
}

function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.toggle}>
      <View style={styles.flex}>
        <AppText variant="label">{label}</AppText>
        {hint ? (
          <AppText variant="caption" muted>
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#FFFFFF"
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 18 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', gap: 10 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
