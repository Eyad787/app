import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BarChart } from '@/components/BarChart';
import { Card } from '@/components/Card';
import { CategoryIcon } from '@/components/CategoryIcon';
import { DonutChart } from '@/components/DonutChart';
import { EmptyState } from '@/components/EmptyState';
import { MonthSelector } from '@/components/MonthSelector';
import { Screen } from '@/components/Screen';
import { getCategory } from '@/constants/categories';
import {
  averageDaily,
  compareWithPreviousMonth,
  filterByMonth,
  sumByCategory,
  sumByDay,
} from '@/lib/calculations';
import { addMonths, formatMonth, monthKeyOf } from '@/lib/dates';
import { useExpenses } from '@/lib/ExpensesContext';
import { formatMoney, formatPercent } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';
import { useToday } from '@/lib/useToday';

export default function StatsScreen() {
  const colors = useThemeColors();
  const today = useToday();
  const { expenses, settings } = useExpenses();
  const { currency } = settings;
  const currentMonth = monthKeyOf(today);
  const [month, setMonth] = useState(currentMonth);

  const data = useMemo(() => {
    const monthExpenses = filterByMonth(expenses, month);
    const byCategory = sumByCategory(monthExpenses);
    return {
      count: monthExpenses.length,
      byCategory,
      byDay: sumByDay(monthExpenses, month),
      comparison: compareWithPreviousMonth(expenses, month),
      average: averageDaily(expenses, month, today),
      top: byCategory[0] ?? null,
    };
  }, [expenses, month, today]);

  const { comparison } = data;
  const prevMonthName = formatMonth(addMonths(month, -1)).split(' ')[0];

  return (
    <Screen title="الإحصائيات">
      <ScrollView contentContainerStyle={styles.content}>
        <MonthSelector
          month={month}
          onPrev={() => setMonth(addMonths(month, -1))}
          onNext={() => setMonth(addMonths(month, 1))}
          canGoNext={month < currentMonth}
        />

        {data.count === 0 ? (
          <Card>
            <EmptyState
              compact
              icon="pie-chart-outline"
              title="مفيش مصاريف في الشهر ده"
              message="لما تسجّل مصاريف في الشهر ده هتظهر هنا الرسوم والإحصائيات."
            />
          </Card>
        ) : (
          <>
            <View style={styles.tiles}>
              <Card style={styles.tile}>
                <AppText variant="label" muted>
                  إجمالي الشهر
                </AppText>
                <AppText variant="heading" numberOfLines={1} adjustsFontSizeToFit>
                  {formatMoney(comparison.current, currency)}
                </AppText>
              </Card>
              <Card style={styles.tile}>
                <AppText variant="label" muted>
                  مقارنة بـ {prevMonthName}
                </AppText>
                {comparison.changePercent === null ? (
                  <AppText variant="label" muted>
                    مفيش بيانات للشهر اللي فات
                  </AppText>
                ) : (
                  <View style={styles.changeRow}>
                    <Ionicons
                      name={
                        comparison.direction === 'up'
                          ? 'trending-up'
                          : comparison.direction === 'down'
                            ? 'trending-down'
                            : 'remove'
                      }
                      size={24}
                      color={
                        comparison.direction === 'up'
                          ? colors.danger
                          : comparison.direction === 'down'
                            ? colors.success
                            : colors.textMuted
                      }
                    />
                    <AppText
                      variant="heading"
                      color={
                        comparison.direction === 'up'
                          ? colors.danger
                          : comparison.direction === 'down'
                            ? colors.success
                            : colors.text
                      }
                    >
                      {comparison.direction === 'same'
                        ? 'زي ما هو'
                        : `${comparison.direction === 'up' ? 'زيادة' : 'نقص'} ${formatPercent(
                            Math.abs(comparison.changePercent),
                          )}`}
                    </AppText>
                  </View>
                )}
                <AppText variant="caption" muted>
                  الشهر اللي فات: {formatMoney(comparison.previous, currency)}
                </AppText>
              </Card>
            </View>

            <View style={styles.tiles}>
              {data.top ? (
                <Card style={styles.tile}>
                  <AppText variant="label" muted>
                    أكتر نوع اتصرف فيه
                  </AppText>
                  <View style={styles.changeRow}>
                    <CategoryIcon category={data.top.category} size={34} />
                    <AppText variant="heading">{getCategory(data.top.category).label}</AppText>
                  </View>
                  <AppText variant="caption" muted>
                    {formatMoney(data.top.total, currency)} ({formatPercent(data.top.percent)})
                  </AppText>
                </Card>
              ) : null}
              <Card style={styles.tile}>
                <AppText variant="label" muted>
                  متوسط الصرف اليومي
                </AppText>
                <AppText variant="heading" numberOfLines={1} adjustsFontSizeToFit>
                  {formatMoney(data.average, currency)}
                </AppText>
                <AppText variant="caption" muted>
                  {month === currentMonth ? 'لحد النهارده' : 'على مدار الشهر'}
                </AppText>
              </Card>
            </View>

            <Card style={styles.section}>
              <AppText variant="heading">المصاريف حسب النوع</AppText>
              <DonutChart data={data.byCategory} total={comparison.current} currency={currency} />
            </Card>

            <Card style={styles.section}>
              <AppText variant="heading">المصاريف اليومية</AppText>
              <BarChart key={month} data={data.byDay} currency={currency} today={today} />
            </Card>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, gap: 6, padding: 16 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  section: { gap: 14 },
});
