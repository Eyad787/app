import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Fragment, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DayHeader } from '@/components/DayHeader';
import { EmptyState } from '@/components/EmptyState';
import { ExpenseRow } from '@/components/ExpenseRow';
import { Fab } from '@/components/Fab';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import {
  budgetStatus,
  groupByDay,
  sortByNewest,
  totalForDay,
  totalForMonth,
  totalForWeek,
} from '@/lib/calculations';
import { confirmDelete } from '@/lib/confirm';
import { formatDateLong, formatMonth, monthKeyOf } from '@/lib/dates';
import { useExpenses } from '@/lib/ExpensesContext';
import { formatMoney } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';
import { useToday } from '@/lib/useToday';

const RECENT_LIMIT = 15;

const openNew = () => router.push('/expense');
const openEdit = (id: string) => router.push({ pathname: '/expense', params: { id } });

export default function HomeScreen() {
  const colors = useThemeColors();
  const { expenses, settings, isLoaded, deleteExpense } = useExpenses();
  const today = useToday();
  const month = monthKeyOf(today);
  const { currency } = settings;

  const stats = useMemo(() => {
    const monthTotal = totalForMonth(expenses, month);
    return {
      monthTotal,
      dayTotal: totalForDay(expenses, today),
      weekTotal: totalForWeek(expenses, today),
      budget: budgetStatus(monthTotal, settings.monthlyBudget),
      recent: groupByDay(sortByNewest(expenses).slice(0, RECENT_LIMIT)),
    };
  }, [expenses, month, today, settings.monthlyBudget]);

  if (!isLoaded) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { budget } = stats;
  const heroFg = colors.onPrimary;

  return (
    <Screen title="مصاريفي" subtitle={formatDateLong(today, today)}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <AppText variant="label" color={heroFg} style={styles.heroLabel}>
            مصاريف شهر {formatMonth(month)}
          </AppText>
          <AppText variant="display" color={heroFg} numberOfLines={1} adjustsFontSizeToFit>
            {formatMoney(stats.monthTotal, currency)}
          </AppText>

          {budget ? (
            <View style={styles.budget}>
              <ProgressBar
                ratio={budget.ratio}
                color={budget.isOver ? colors.danger : heroFg}
                trackColor="rgba(255,255,255,0.28)"
              />
              <View style={styles.budgetRow}>
                <AppText variant="caption" color={heroFg}>
                  صرفت {Math.round(budget.ratio * 100)}% من {formatMoney(budget.budget, currency)}
                </AppText>
                {budget.isOver ? (
                  <View style={[styles.overBadge, { backgroundColor: colors.danger }]}>
                    <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
                    <AppText variant="caption" color="#FFFFFF" bold>
                      عديت الميزانية بـ {formatMoney(-budget.remaining, currency)}
                    </AppText>
                  </View>
                ) : (
                  <AppText variant="caption" color={heroFg} bold>
                    فاضل {formatMoney(budget.remaining, currency)}
                  </AppText>
                )}
              </View>
            </View>
          ) : (
            <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
              <AppText variant="caption" color={heroFg} style={styles.heroHint}>
                حدد ميزانية شهرية من الإعدادات عشان تتابع صرفك ←
              </AppText>
            </Pressable>
          )}
        </View>

        <View style={styles.summaryRow}>
          <SummaryTile icon="today" label="النهارده" value={formatMoney(stats.dayTotal, currency)} />
          <SummaryTile icon="calendar" label="الأسبوع ده" value={formatMoney(stats.weekTotal, currency)} />
        </View>

        {expenses.length === 0 ? (
          <Card>
            <EmptyState
              title="لسه مفيش مصاريف"
              message="ابدأ سجّل أول مصروف ليك، وهتلاقي هنا ملخص صرفك يوم بيوم."
              action={<Button title="ضيف أول مصروف" icon="add-circle" onPress={openNew} />}
            />
          </Card>
        ) : (
          <View>
            <View style={styles.sectionTitle}>
              <AppText variant="heading">آخر المصاريف</AppText>
              <Pressable onPress={() => router.push('/expenses')} hitSlop={10}>
                <AppText variant="label" color={colors.primary}>
                  عرض الكل
                </AppText>
              </Pressable>
            </View>
            {stats.recent.map((group) => (
              <Fragment key={group.date}>
                <DayHeader date={group.date} total={group.total} currency={currency} today={today} />
                <Card style={styles.groupCard}>
                  {group.data.map((e, i) => (
                    <View key={e.id}>
                      {i > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
                      <ExpenseRow
                        expense={e}
                        currency={currency}
                        onPress={() => openEdit(e.id)}
                        onDelete={() => confirmDelete(() => deleteExpense(e.id))}
                      />
                    </View>
                  ))}
                </Card>
              </Fragment>
            ))}
          </View>
        )}
      </ScrollView>
      <Fab onPress={openNew} />
    </Screen>
  );
}

function SummaryTile({ icon, label, value }: { icon: 'today' | 'calendar'; label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <Card style={styles.tile}>
      <View style={styles.tileHead}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <AppText variant="label" muted>
          {label}
        </AppText>
      </View>
      <AppText variant="heading" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 120, gap: 14 },
  hero: { borderRadius: 24, padding: 22, gap: 6 },
  heroLabel: { opacity: 0.9 },
  heroHint: { opacity: 0.85, marginTop: 4 },
  budget: { marginTop: 10, gap: 8 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  overBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, gap: 6, padding: 16 },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  groupCard: { padding: 4 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
});
