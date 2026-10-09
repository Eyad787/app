import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { SUBJECT_COLORS } from '@/constants/colors';
import { useColors } from '@/hooks/useTheme';
import type { Subject } from '@/lib/types';

import { AppText } from './AppText';
import { Chip } from './Chip';

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      {children}
      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" muted>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export function TextField({ style, multiline, ...rest }: TextInputProps) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...rest}
      multiline={multiline}
      style={[
        styles.input,
        multiline && styles.multiline,
        { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    />
  );
}

/** زرار شكله زي حقل الإدخال (للتاريخ والساعة) */
export function PickerButton({
  value,
  placeholder,
  icon,
  onPress,
  onClear,
}: {
  value: string | null;
  placeholder: string;
  icon: 'calendar-outline' | 'time-outline';
  onPress: () => void;
  onClear?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.input, styles.pickerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <AppText style={styles.flex} color={value ? colors.text : colors.textMuted}>
        {value ?? placeholder}
      </AppText>
      {value && onClear ? (
        <Pressable onPress={onClear} hitSlop={10} accessibilityLabel="مسح">
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export function SubjectPicker({
  subjects,
  value,
  onChange,
  allowNone,
  noneLabel = 'عامة',
}: {
  subjects: Subject[];
  value: string | null;
  onChange: (id: string | null) => void;
  allowNone?: boolean;
  noneLabel?: string;
}) {
  return (
    <View style={styles.wrap}>
      {allowNone ? <Chip label={noneLabel} selected={value == null} onPress={() => onChange(null)} /> : null}
      {subjects.map((s) => (
        <Chip key={s.id} label={s.name} color={s.color} selected={value === s.id} onPress={() => onChange(s.id)} />
      ))}
    </View>
  );
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      {SUBJECT_COLORS.map((c) => {
        const active = c.toLowerCase() === value.toLowerCase();
        return (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`لون ${c}`}
            style={[styles.swatch, { backgroundColor: c, borderColor: active ? colors.text : 'transparent' }]}
          >
            {active ? <Ionicons name="checkmark" size={20} color="#FFFFFF" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const colors = useColors();
  const btn = (icon: 'add' | 'remove', next: number, disabled: boolean) => (
    <Pressable
      onPress={() => !disabled && onChange(next)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={icon === 'add' ? 'زوّد' : 'قلّل'}
      style={[styles.stepBtn, { backgroundColor: colors.primarySoft, opacity: disabled ? 0.4 : 1 }]}
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
    </Pressable>
  );
  return (
    <View style={styles.stepper}>
      {btn('remove', Math.max(min, value - step), value <= min)}
      <AppText variant="heading" center style={styles.stepValue}>
        {value}
        {suffix ? ` ${suffix}` : ''}
      </AppText>
      {btn('add', Math.min(max, value + step), value >= max)}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: Platform.OS === 'web' ? 'right' : 'left',
    writingDirection: 'rtl',
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 80 },
});
