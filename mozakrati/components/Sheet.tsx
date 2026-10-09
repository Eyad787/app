import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';

import { useColors } from '@/hooks/useTheme';

import { AppText } from './AppText';

/** نافذة صغيرة في نص الشاشة (للمنتقيات) */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  const colors = useColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel="Close">
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {title ? (
              <AppText variant="heading" center>
                {title}
              </AppText>
            ) : null}
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 16 },
  sheet: { borderRadius: 24, maxWidth: 440, width: '100%', maxHeight: '90%', alignSelf: 'center', overflow: 'hidden' },
  content: { padding: 16, gap: 12 },
});
