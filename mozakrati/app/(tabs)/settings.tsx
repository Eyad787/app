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
import { countWord, formatDuration } from '@/lib/logic/dates';
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
      notify('Export failed', e instanceof Error ? e.message : 'Something went wrong');
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
        title: 'Import backup',
        message: `This backup has ${countWord(imported.subjects.length, 'subject')} and ${countWord(imported.tasks.length, 'task')}. Your current data will be replaced. Continue?`,
        confirmText: 'Import',
      });
      if (!ok) return;
      await replaceAll(imported);
      notify('Done ✅', 'Your data was restored.');
    } catch (e) {
      notify("Can't use this file", e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(null);
    }
  };

  const doReset = async () => {
    const first = await confirmAsync({
      title: 'Delete all data',
      message: 'Everything will be deleted: subjects, schedule, exams, tasks and study sessions. Consider exporting a backup first.',
      confirmText: 'Yes, delete',
    });
    if (!first) return;
    const second = await confirmAsync({
      title: 'Are you absolutely sure?',
      message: 'This cannot be undone.',
      confirmText: 'Delete forever',
    });
    if (!second) return;
    await resetAll();
    router.replace('/onboarding');
  };

  const profileSection = (
    <Section title="Your profile">
      <Card style={styles.gap}>
        <Field label="Name">
          <TextField value={profile.name} onChangeText={(name) => updateProfile({ name })} placeholder="Your name" maxLength={60} />
        </Field>
        <Field label="Faculty">
          <TextField value={profile.faculty} onChangeText={(faculty) => updateProfile({ faculty })} placeholder="e.g. Faculty of Engineering, Cairo" maxLength={80} />
        </Field>
        <Field label="Year">
          <View style={styles.wrap}>
            {YEAR_OPTIONS.map((y) => (
              <Chip key={y} label={y} selected={profile.year === y} onPress={() => updateProfile({ year: y })} />
            ))}
          </View>
        </Field>
        <Field label="Current term">
          <View style={styles.wrap}>
            {TERM_OPTIONS.map((t) => (
              <Chip key={t} label={t} selected={profile.term === t} onPress={() => updateProfile({ term: t })} />
            ))}
          </View>
        </Field>
        <Field label="Grading system">
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
    <Section title="Studying">
      <Card style={styles.gap}>
        <Field label="Focus session">
          <Stepper value={settings.pomodoro.workMinutes} onChange={(v) => setPomodoro({ workMinutes: v })} min={5} max={120} step={5} suffix="min" />
        </Field>
        <Field label="Short break">
          <Stepper value={settings.pomodoro.shortBreakMinutes} onChange={(v) => setPomodoro({ shortBreakMinutes: v })} min={1} max={30} suffix="min" />
        </Field>
        <Field label="Long break">
          <Stepper value={settings.pomodoro.longBreakMinutes} onChange={(v) => setPomodoro({ longBreakMinutes: v })} min={5} max={60} step={5} suffix="min" />
        </Field>
        <Field label="Long break after">
          <Stepper value={settings.pomodoro.sessionsBeforeLongBreak} onChange={(v) => setPomodoro({ sessionsBeforeLongBreak: v })} min={2} max={8} suffix="sessions" />
        </Field>
        <Field label="Daily study goal" hint={formatDuration(settings.dailyGoalMinutes)}>
          <Stepper value={settings.dailyGoalMinutes} onChange={(v) => updateSettings({ dailyGoalMinutes: v })} min={0} max={720} step={15} suffix="min" />
        </Field>
        <Toggle label="Sound when a session ends" value={settings.sound} onChange={(sound) => updateSettings({ sound })} />
        <Toggle label="Vibrate when a session ends" value={settings.vibration} onChange={(vibration) => updateSettings({ vibration })} />
      </Card>
    </Section>
  );

  const otherSection = (
    <>
      <Section title="Schedule & attendance">
        <Card style={styles.gap}>
          <Toggle label="Show Friday in schedule" value={settings.showFriday} onChange={(showFriday) => updateSettings({ showFriday })} />
          <Field label="Absence limit" hint="Used by attendance tracking (next phase)">
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

      <Section title="Backup">
        <Card style={styles.gap}>
          <AppText variant="caption" muted>
            Your data is stored only on this device. Export a backup (JSON file) to keep it safe or move it to another device.
          </AppText>
          <View style={styles.row}>
            <Button title="Export" icon="download-outline" variant="secondary" onPress={doExport} loading={busy === 'export'} style={styles.flex} />
            <Button title="Import" icon="cloud-upload-outline" variant="secondary" onPress={doImport} loading={busy === 'import'} style={styles.flex} />
          </View>
        </Card>
      </Section>

      <Section title="Danger zone">
        <Card style={styles.gap}>
          <Button title="Delete all data" icon="trash-outline" variant="danger" onPress={doReset} />
        </Card>
      </Section>

      <AppText variant="caption" muted center>
        {APP_NAME} • version {Constants.expoConfig?.version ?? '1.0.0'}
      </AppText>
    </>
  );

  return (
    <Screen title="Settings">
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
