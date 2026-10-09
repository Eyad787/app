import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { withAlpha } from '@/constants/colors';
import { CLASS_KIND_LABELS } from '@/constants/labels';
import { useColors } from '@/hooks/useTheme';
import { formatTime } from '@/lib/logic/dates';
import type { ClassSession, Subject } from '@/lib/types';

import { AppText } from './AppText';
import { Card } from './Card';

type Props = {
  item: ClassSession;
  subject: Subject | undefined;
  status?: 'current' | 'next' | 'past' | null;
  onPress?: () => void;
};

export function ClassCard({ item, subject, status, onPress }: Props) {
  const colors = useColors();
  const color = subject?.color ?? colors.primary;
  const highlight = status === 'current' || status === 'next';
  return (
    <Card
      onPress={onPress}
      accent={color}
      style={[
        highlight && { borderColor: color, borderWidth: 2, borderStartWidth: 5, backgroundColor: withAlpha(color, 0.07) },
        status === 'past' && { opacity: 0.55 },
      ]}
      accessibilityLabel={`${subject?.name ?? ''} ${CLASS_KIND_LABELS[item.kind]}`}
    >
      <View style={styles.row}>
        <View style={styles.time}>
          <AppText variant="label" bold>
            {formatTime(item.start)}
          </AppText>
          <AppText variant="caption" muted>
            {formatTime(item.end)}
          </AppText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <AppText variant="label" bold numberOfLines={1} style={styles.flex}>
              {subject?.name ?? 'Subject'}
            </AppText>
            {status === 'current' ? <Pill text="Now" color={color} /> : status === 'next' ? <Pill text="Next" color={color} /> : null}
          </View>
          <View style={styles.meta}>
            <AppText variant="caption" color={color} bold>
              {CLASS_KIND_LABELS[item.kind]}
            </AppText>
            {item.location ? <Meta icon="location-outline" text={item.location} /> : null}
            {item.instructor ? <Meta icon="person-outline" text={item.instructor} /> : null}
          </View>
        </View>
      </View>
    </Card>
  );
}

function Pill({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <AppText variant="tiny" color="#FFFFFF">
        {text}
      </AppText>
    </View>
  );
}

function Meta({ icon, text }: { icon: 'location-outline' | 'person-outline'; text: string }) {
  const colors = useColors();
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <AppText variant="caption" muted numberOfLines={1}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  time: { alignItems: 'center', minWidth: 76 },
  divider: { width: 1, alignSelf: 'stretch' },
  body: { flex: 1, gap: 4, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3, maxWidth: '100%' },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
});
