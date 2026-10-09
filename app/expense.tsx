import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DatePickerModal } from '@/components/DatePickerModal';
import { EmptyState } from '@/components/EmptyState';
import { CATEGORIES } from '@/constants/categories';
import { confirmDelete } from '@/lib/confirm';
import { addDays, formatDayLabel } from '@/lib/dates';
import { useExpenses } from '@/lib/ExpensesContext';
import { parseAmount, sanitizeAmountInput } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';
import type { CategoryId, DateKey } from '@/lib/types';
import { useToday } from '@/lib/useToday';

export default function ExpenseFormScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const today = useToday();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { expenses, settings, isLoaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const existing = id ? expenses.find((e) => e.id === id) : undefined;
  const isEdit = !!id;

  const [amountText, setAmountText] = useState(existing ? String(existing.amount) : '');
  const [category, setCategory] = useState<CategoryId | null>(existing?.category ?? null);
  const [date, setDate] = useState<DateKey>(existing?.date ?? today);
  const [note, setNote] = useState(existing?.note ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; category?: string }>({});

  // لو البيانات اتحملت بعد ما الشاشة اتفتحت (فتح مباشر)، نملا الحقول
  const filled = useRef(!!existing);
  useEffect(() => {
    if (existing && !filled.current) {
      filled.current = true;
      setAmountText(String(existing.amount));
      setCategory(existing.category);
      setDate(existing.date);
      setNote(existing.note);
    }
  }, [existing]);

  const save = () => {
    const amount = parseAmount(amountText);
    const nextErrors: typeof errors = {};
    if (amount === null) nextErrors.amount = 'اكتب مبلغ صحيح أكبر من صفر';
    if (!category) nextErrors.category = 'اختار نوع المصروف';
    setErrors(nextErrors);
    if (amount === null || !category) return;

    const input = { amount, category, date, note: note.trim() };
    if (isEdit && existing) updateExpense(existing.id, input);
    else addExpense(input);
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    confirmDelete(() => {
      deleteExpense(existing.id);
      router.back();
    });
  };

  if (isEdit && isLoaded && !existing) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'تعديل المصروف' }} />
        <EmptyState
          icon="alert-circle-outline"
          title="المصروف ده مش موجود"
          message="يمكن يكون اتمسح."
          action={<Button title="رجوع" onPress={() => router.back()} />}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: isEdit ? 'تعديل المصروف' : 'مصروف جديد' }} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.amountCard}>
          <AppText variant="label" muted center>
            المبلغ
          </AppText>
          <View style={styles.amountRow}>
            <TextInput
              value={amountText}
              onChangeText={(t) => {
                setAmountText(sanitizeAmountInput(t));
                if (errors.amount) setErrors((e) => ({ ...e, amount: undefined }));
              }}
              placeholder="0"
              placeholderTextColor={colors.border}
              keyboardType="decimal-pad"
              autoFocus={!isEdit}
              maxLength={12}
              accessibilityLabel="المبلغ"
              style={[styles.amountInput, { color: colors.text }]}
            />
            <AppText variant="heading" muted>
              {settings.currency}
            </AppText>
          </View>
          {errors.amount ? (
            <AppText variant="caption" color={colors.danger} center>
              {errors.amount}
            </AppText>
          ) : null}
        </Card>

        <View style={styles.section}>
          <AppText variant="heading">النوع</AppText>
          <View style={styles.categories}>
            {CATEGORIES.map((c) => {
              const selected = category === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setCategory(c.id);
                    if (errors.category) setErrors((e) => ({ ...e, category: undefined }));
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={c.label}
                  style={({ pressed }) => [
                    styles.categoryItem,
                    {
                      backgroundColor: selected ? `${c.color}22` : colors.card,
                      borderColor: selected ? c.color : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: selected ? c.color : `${c.color}22` }]}>
                    <Ionicons name={c.icon} size={24} color={selected ? '#FFFFFF' : c.color} />
                  </View>
                  <AppText variant="label" center numberOfLines={1}>
                    {c.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
          {errors.category ? (
            <AppText variant="caption" color={colors.danger}>
              {errors.category}
            </AppText>
          ) : null}
        </View>

        <View style={styles.section}>
          <AppText variant="heading">التاريخ</AppText>
          <Pressable
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`التاريخ: ${formatDayLabel(date, today)}. اضغط للتغيير`}
            style={({ pressed }) => [
              styles.field,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
            <AppText style={styles.flex}>{formatDayLabel(date, today)}</AppText>
            <AppText variant="label" color={colors.primary}>
              تغيير
            </AppText>
          </Pressable>
          <View style={styles.quickDates}>
            <QuickDate label="النهارده" active={date === today} onPress={() => setDate(today)} />
            <QuickDate
              label="امبارح"
              active={date === addDays(today, -1)}
              onPress={() => setDate(addDays(today, -1))}
            />
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="heading">
            ملاحظة <AppText muted>(اختياري)</AppText>
          </AppText>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="مثلاً: غدا مع الشغل"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={200}
            accessibilityLabel="ملاحظة"
            style={[
              styles.field,
              styles.noteInput,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>

        <Button title={isEdit ? 'حفظ التعديلات' : 'حفظ'} icon="checkmark-circle" onPress={save} />
        {isEdit ? <Button title="حذف المصروف" icon="trash-outline" variant="danger" onPress={remove} /> : null}
      </ScrollView>

      <DatePickerModal
        visible={pickerOpen}
        value={date}
        today={today}
        onSelect={setDate}
        onClose={() => setPickerOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

function QuickDate({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.quickDate,
        { backgroundColor: active ? colors.primarySoft : 'transparent', borderColor: active ? colors.primary : colors.border },
      ]}
    >
      <AppText variant="label" color={active ? colors.primary : colors.textMuted}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 20 },
  amountCard: { gap: 4, paddingVertical: 22 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  amountInput: {
    fontSize: 52,
    fontWeight: '800',
    minWidth: 120,
    textAlign: 'center',
    paddingVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  section: { gap: 10 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryItem: {
    width: '22.6%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  categoryIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  noteInput: { fontSize: 17, minHeight: 90, paddingTop: 14, textAlignVertical: 'top' },
  quickDates: { flexDirection: 'row', gap: 10 },
  quickDate: { paddingHorizontal: 16, minHeight: 40, justifyContent: 'center', borderRadius: 20, borderWidth: 1 },
});
