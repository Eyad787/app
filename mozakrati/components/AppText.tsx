import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { useColors } from '@/hooks/useTheme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'tiny';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  color?: string;
  bold?: boolean;
  center?: boolean;
};

/**
 * نص موحّد للتطبيق كله.
 * على الموبايل في وضع RTL، textAlign: 'left' معناها "بداية السطر" (يعني اليمين).
 * على الويب الصفحة كلها dir="rtl" فبنستخدم 'right' مباشرة.
 */
export function AppText({ variant = 'body', muted, color, bold, center, style, ...rest }: Props) {
  const colors = useColors();
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
  base: { textAlign: Platform.OS === 'web' ? 'right' : 'left', writingDirection: 'rtl' },
  display: { fontSize: 34, fontWeight: '800', lineHeight: 44 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 36 },
  heading: { fontSize: 18, fontWeight: '700', lineHeight: 27 },
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  caption: { fontSize: 13, lineHeight: 19 },
  tiny: { fontSize: 11.5, lineHeight: 16, fontWeight: '600' },
  bold: { fontWeight: '700' },
  center: { textAlign: 'center' },
});
