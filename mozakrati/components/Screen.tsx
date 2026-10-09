import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MAX_CONTENT_WIDTH } from '@/constants/layout';
import { useResponsive } from '@/hooks/useResponsive';
import { useColors } from '@/hooks/useTheme';

import { AppText } from './AppText';
import { Button } from './Button';

type Props = {
  title: string;
  subtitle?: string;
  /** أزرار إضافية جنب العنوان */
  actions?: ReactNode;
  /** زرار الإضافة: Fab على الموبايل، وزرار في العنوان على اللاب توب */
  onAdd?: () => void;
  addLabel?: string;
  /** محتوى ثابت تحت العنوان (فلاتر مثلاً) */
  toolbar?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

/** حاوية كل شاشة رئيسية: عنوان + مساحة آمنة + عرض أقصى على الشاشات الكبيرة */
export function Screen({ title, subtitle, actions, onAdd, addLabel = 'Add', toolbar, children, scroll = true }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { isWide } = useResponsive();
  const pad = isWide ? 32 : 16;

  const body = (
    <View style={[styles.inner, { paddingHorizontal: pad, paddingBottom: onAdd && !isWide ? 110 : 32 }]}>{children}</View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: isWide ? 12 : insets.top }]}>
      <View style={[styles.headerWrap, { paddingHorizontal: pad }]}>
        <View style={styles.header}>
          <View style={styles.titles}>
            <AppText variant="title" numberOfLines={1}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="caption" muted numberOfLines={1}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {actions}
          {onAdd && isWide ? <Button title={addLabel} icon="add" onPress={onAdd} small /> : null}
        </View>
        {toolbar}
      </View>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={isWide}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{body}</View>
      )}
      {onAdd && !isWide ? (
        <Pressable
          onPress={onAdd}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.94 : 1 }] },
          ]}
        >
          <Ionicons name="add" size={32} color={colors.onPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  headerWrap: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', gap: 10, paddingBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10 },
  titles: { flex: 1, minWidth: 0 },
  scrollContent: { flexGrow: 1 },
  inner: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingTop: 6, gap: 18, flexGrow: 1 },
  fab: {
    position: 'absolute',
    bottom: 20,
    end: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
});
