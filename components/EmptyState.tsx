import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@/lib/theme';

import { AppText } from './AppText';

type Props = {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ icon = 'wallet-outline', title, message, action, compact }: Props) {
  const colors = useThemeColors();
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={compact ? 34 : 48} color={colors.primary} />
      </View>
      <AppText variant="heading" center>
        {title}
      </AppText>
      {message ? (
        <AppText muted center style={styles.message}>
          {message}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 },
  compact: { paddingVertical: 24 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  message: { maxWidth: 300 },
  action: { marginTop: 12, alignSelf: 'stretch' },
});
