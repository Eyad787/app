import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/lib/theme';

import { AppText } from './AppText';

type Props = { title: string; subtitle?: string; children: ReactNode };

/** حاوية الشاشات الرئيسية: عنوان كبير فوق + مساحة آمنة */
export function Screen({ title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? <AppText muted>{subtitle}</AppText> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
});
