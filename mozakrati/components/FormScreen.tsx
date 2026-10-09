import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/useTheme';

import { Button } from './Button';

type Props = {
  title: string;
  children: ReactNode;
  onSave: () => void;
  saveLabel?: string;
  canSave?: boolean;
  onDelete?: () => void;
};

/** شاشة نموذج (إضافة/تعديل) بزرار حفظ ثابت تحت */
export function FormScreen({ title, children, onSave, saveLabel = 'Save', canSave = true, onDelete }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title }} />
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          { borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={[styles.inner, styles.footerRow]}>
          {onDelete ? <Button title="Delete" icon="trash-outline" variant="danger" onPress={onDelete} /> : null}
          <Button title={saveLabel} icon="checkmark" onPress={onSave} disabled={!canSave} style={styles.flex} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  inner: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: 20 },
  footer: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 12 },
  footerRow: { flexDirection: 'row', gap: 10 },
});
