import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/useTheme';

import { AppText } from './AppText';
import { Button, type IconName } from './Button';

type Props = {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

/** شاشة فاضية لطيفة فيها زرار يوجّه المستخدم يضيف أول عنصر */
export function EmptyState({ icon, title, message, actionLabel, onAction, compact }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={[styles.circle, compact && styles.circleSmall, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={compact ? 28 : 44} color={colors.primary} />
      </View>
      <AppText variant={compact ? 'label' : 'heading'} center>
        {title}
      </AppText>
      {message ? (
        <AppText variant="caption" muted center style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} icon="add" onPress={onAction} small={compact} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 8 },
  compact: { paddingVertical: 18, gap: 6 },
  circle: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  circleSmall: { width: 56, height: 56, borderRadius: 28, marginBottom: 2 },
  message: { maxWidth: 340 },
  action: { marginTop: 10 },
});
