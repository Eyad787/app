import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColors } from '@/lib/theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  color?: string;
  bold?: boolean;
  center?: boolean;
};

/**
 * نص موحّد للتطبيق كله.
 * textAlign: 'left' في وضع RTL معناها "بداية السطر" يعني اليمين.
 */
export function AppText({ variant = 'body', muted, color, bold, center, style, ...rest }: Props) {
  const colors = useThemeColors();
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        styles[variant],
        { color: color ?? (muted ? colors.textMuted : colors.text) },
        bold && styles.bold,
        center && styles.center,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { textAlign: 'left', writingDirection: 'rtl' },
  display: { fontSize: 36, fontWeight: '800', lineHeight: 46 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 36 },
  heading: { fontSize: 19, fontWeight: '700', lineHeight: 28 },
  body: { fontSize: 17, lineHeight: 25 },
  label: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  caption: { fontSize: 14, lineHeight: 20 },
  bold: { fontWeight: '700' },
  center: { textAlign: 'center' },
});
