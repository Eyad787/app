import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { DayHeader } from '@/components/DayHeader';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseRow } from '@/components/ExpenseRow';
import { Fab } from '@/components/Fab';
import { Screen } from '@/components/Screen';
import { CATEGORIES } from '@/constants/categories';
import { availableMonths, filterExpenses, groupByDay, totalOf } from '@/lib/calculations';
import { confirmDelete } from '@/lib/confirm';
import { formatMonth } from '@/lib/dates';
import { useExpenses } from '@/lib/ExpensesContext';
import { formatMoney } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';
import type { CategoryId, MonthKey } from '@/lib/types';
import { useToday } from '@/lib/useToday';

const openNew = () => router.push('/expense');

export default function ExpensesScreen() {
  const colors = useThemeColors();
  const today = useToday();
  const { expenses, settings, deleteExpense } = useExpenses();
  const { currency } = settings;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [month, setMonth] = useState<MonthKey | null>(null);

  const months = useMemo(() => availableMonths(expenses), [expenses]);
  const filtered = useMemo(
    () => filterExpenses(expenses, { query, category, month }),
    [expenses, query, category, month],
  );
  const sections = useMemo(() => groupByDay(filtered), [filtered]);
  const hasFilters = !!query.trim() || !!category || !!month;

  const clearFilters = () => {
    setQuery('');
    setCategory(null);
    setMonth(null);
  };

  if (expenses.length === 0) {
    return (
      <Screen title="كل المصاريف">
        <EmptyState
          icon="receipt-outline"
          title="القائمة فاضية"
          message="كل المصاريف اللي هتسجلها هتظهر هنا، وتقدر تدوّر فيها وتفلترها."
          action={<Button title="ضيف مصروف" icon="add-circle" onPress={openNew} />}
        />
      </Screen>
    );
  }

  return (
    <Screen title="كل المصاريف">
      <View style={styles.filters}>
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="دوّر في الملاحظات..."
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            accessibilityLabel="بحث في الملاحظات"
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="مسح البحث">
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="كل الأنواع" selected={!category} onPress={() => setCategory(null)} />
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              icon={c.icon}
              color={c.color}
              selected={category === c.id}
              onPress={() => setCategory(category === c.id ? null : c.id)}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="كل الشهور" selected={!month} onPress={() => setMonth(null)} />
          {months.map((m) => (
            <Chip key={m} label={formatMonth(m)} selected={month === m} onPress={() => setMonth(month === m ? null : m)} />
          ))}
        </ScrollView>

        <View style={styles.summary}>
          <AppText variant="caption" muted>
            {filtered.length} مصروف • الإجمالي {formatMoney(totalOf(filtered), currency)}
          </AppText>
          {hasFilters ? (
            <Pressable onPress={clearFilters} hitSlop={8}>
              <AppText variant="label" color={colors.primary}>
                مسح الفلاتر
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <DayHeader date={section.date} total={section.total} currency={currency} today={today} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ExpenseRow
            expense={item}
            currency={currency}
            onPress={() => router.push({ pathname: '/expense', params: { id: item.id } })}
            onDelete={() => confirmDelete(() => deleteExpense(item.id))}
          />
        )}
        ListHeaderComponent={
          <AppText variant="caption" muted center style={styles.hint}>
            اضغط على أي مصروف للتعديل • اسحبه يمين أو شمال أو اضغط مطولاً للحذف
          </AppText>
        }
        ListEmptyComponent={
          <EmptyState
            compact
            icon="search-outline"
            title="مفيش نتايج"
            message="جرّب تغيّر كلمة البحث أو الفلاتر."
            action={<Button title="مسح الفلاتر" variant="secondary" onPress={clearFilters} />}
          />
        }
      />
      <Fab onPress={openNew} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 10, paddingTop: 4 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 17, paddingVertical: 10 },
  chips: { gap: 8, paddingHorizontal: 16 },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  separator: { height: 8 },
  hint: { marginTop: 4 },
});
