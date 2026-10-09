import { Pressable, StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/useTheme';

import { AppText } from './AppText';

type Option<T extends string> = { value: T; label: string; count?: number };

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.cardAlt }]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && { backgroundColor: colors.card }]}
          >
            <AppText variant="caption" bold center color={active ? colors.text : colors.textMuted}>
              {o.label}
              {o.count != null ? ` (${o.count})` : ''}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: 14, padding: 4, gap: 4 },
  item: { flex: 1, minHeight: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
