import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { APP_NAME, APP_VERSION } from '@/constants/app';
import { CURRENCIES } from '@/constants/currencies';
import { useExpenses } from '@/lib/ExpensesContext';
import { exportAndShareCsv } from '@/lib/exportCsv';
import { formatMoney, formatNumber, parseAmount, sanitizeAmountInput } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { expenses, settings, updateSettings, resetAll } = useExpenses();

  const [budgetText, setBudgetText] = useState(settings.monthlyBudget ? String(settings.monthlyBudget) : '');
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [customCurrency, setCustomCurrency] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setBudgetText(settings.monthlyBudget ? String(settings.monthlyBudget) : '');
  }, [settings.monthlyBudget]);

  const saveBudget = () => {
    const value = parseAmount(budgetText);
    if (value === null) {
      setBudgetError('اكتب مبلغ صحيح أكبر من صفر');
      return;
    }
    setBudgetError(null);
    updateSettings({ monthlyBudget: value });
    Alert.alert('تم', `الميزانية الشهرية بقت ${formatMoney(value, settings.currency)}`);
  };

  const removeBudget = () => {
    setBudgetError(null);
    updateSettings({ monthlyBudget: null });
  };

  const saveCustomCurrency = () => {
    const value = customCurrency.trim();
    if (!value) return;
    updateSettings({ currency: value });
    setCustomCurrency('');
  };

  const exportCsv = async () => {
    if (expenses.length === 0) {
      Alert.alert('مفيش بيانات', 'سجّل مصاريف الأول عشان تقدر تصدّرها.');
      return;
    }
    setExporting(true);
    try {
      await exportAndShareCsv(expenses, settings.currency);
    } catch (err) {
      Alert.alert('حصلت مشكلة', err instanceof Error ? err.message : 'ماقدرناش نصدّر الملف.');
    } finally {
      setExporting(false);
    }
  };

  const clearAll = () => {
    Alert.alert('مسح كل البيانات', 'هيتمسح كل المصاريف والإعدادات. متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'أيوه، كمّل',
        style: 'destructive',
        onPress: () =>
          Alert.alert('تأكيد أخير', 'الخطوة دي مش ممكن ترجع فيها. هتمسح كل حاجة نهائياً؟', [
            { text: 'لأ، رجوع', style: 'cancel' },
            {
              text: 'امسح كل حاجة',
              style: 'destructive',
              onPress: async () => {
                await resetAll();
                Alert.alert('تم', 'اتمسحت كل البيانات.');
              },
            },
          ]),
      },
    ]);
  };

  const isPreset = CURRENCIES.some((c) => c.symbol === settings.currency);

  return (
    <Screen title="الإعدادات">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section icon="wallet-outline" title="الميزانية الشهرية">
          <AppText variant="caption" muted>
            {settings.monthlyBudget
              ? `الميزانية الحالية: ${formatNumber(settings.monthlyBudget)} ${settings.currency}`
              : 'مفيش ميزانية متحددة. حدد مبلغ عشان تتابع صرفك من الرئيسية.'}
          </AppText>
          <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              value={budgetText}
              onChangeText={(t) => setBudgetText(sanitizeAmountInput(t))}
              placeholder="مثلاً 5000"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              maxLength={12}
              accessibilityLabel="الميزانية الشهرية"
              style={[styles.input, { color: colors.text }]}
            />
            <AppText muted>{settings.currency}</AppText>
          </View>
          {budgetError ? (
            <AppText variant="caption" color={colors.danger}>
              {budgetError}
            </AppText>
          ) : null}
          <View style={styles.buttonsRow}>
            <Button title="حفظ" icon="checkmark" onPress={saveBudget} style={styles.flex} />
            {settings.monthlyBudget ? (
              <Button title="إلغاء الميزانية" variant="danger" onPress={removeBudget} style={styles.flex} />
            ) : null}
          </View>
        </Section>

        <Section icon="cash-outline" title="العملة">
          <View style={styles.wrap}>
            {CURRENCIES.map((c) => (
              <Chip
                key={c.symbol}
                label={`${c.name} (${c.symbol})`}
                selected={settings.currency === c.symbol}
                onPress={() => updateSettings({ currency: c.symbol })}
              />
            ))}
            {!isPreset ? <Chip label={settings.currency} selected onPress={() => {}} /> : null}
          </View>
          <AppText variant="caption" muted>
            أو اكتب عملة تانية:
          </AppText>
          <View style={styles.buttonsRow}>
            <View
              style={[styles.inputRow, styles.flex, { backgroundColor: colors.background, borderColor: colors.border }]}
            >
              <TextInput
                value={customCurrency}
                onChangeText={setCustomCurrency}
                placeholder="مثلاً: ل.ل"
                placeholderTextColor={colors.textMuted}
                maxLength={8}
                accessibilityLabel="عملة مخصصة"
                onSubmitEditing={saveCustomCurrency}
                style={[styles.input, { color: colors.text }]}
              />
            </View>
            <Button title="استخدم" variant="secondary" onPress={saveCustomCurrency} disabled={!customCurrency.trim()} />
          </View>
        </Section>

        <Section icon="download-outline" title="تصدير البيانات">
          <AppText variant="caption" muted>
            صدّر كل مصاريفك ({expenses.length}) كملف CSV تقدر تفتحه في Excel أو Google Sheets وتشاركه.
          </AppText>
          <Button title="تصدير ومشاركة CSV" icon="share-outline" variant="secondary" onPress={exportCsv} loading={exporting} />
        </Section>

        <Section icon="trash-outline" title="مسح البيانات" danger>
          <AppText variant="caption" muted>
            هيمسح كل المصاريف والإعدادات من على الموبايل نهائياً.
          </AppText>
          <Button title="مسح كل البيانات" icon="warning-outline" variant="danger" onPress={clearAll} />
        </Section>

        <Section icon="information-circle-outline" title="عن التطبيق">
          <AppText variant="heading">
            {APP_NAME} <AppText muted>• إصدار {APP_VERSION}</AppText>
          </AppText>
          <AppText muted>
            تطبيق بسيط لتسجيل ومتابعة مصاريفك الشخصية. كل بياناتك محفوظة على موبايلك بس، ومن غير إنترنت ولا حسابات.
          </AppText>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({
  icon,
  title,
  danger,
  children,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  danger?: boolean;
  children: ReactNode;
}) {
  const colors = useThemeColors();
  const accent = danger ? colors.danger : colors.primary;
  return (
    <Card style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIcon, { backgroundColor: danger ? colors.dangerSoft : colors.primarySoft }]}>
          <Ionicons name={icon} size={22} color={accent} />
        </View>
        <AppText variant="heading">{title}</AppText>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  flex: { flex: 1 },
  section: { gap: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: { flex: 1, minWidth: 0, fontSize: 18, paddingVertical: 10 },
  buttonsRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
