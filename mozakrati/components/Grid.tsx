import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { GAP } from '@/constants/layout';

type Props = { columns: number; children: ReactNode; gap?: number };

/** شبكة أعمدة: عمود واحد على الموبايل، وأكتر على الشاشات الكبيرة */
export function Grid({ columns, children, gap = GAP }: Props) {
  const items = Children.toArray(children).filter(Boolean);
  if (columns <= 1) return <View style={{ gap }}>{items}</View>;
  return (
    <View style={[styles.row, { marginHorizontal: -gap / 2 }]}>
      {items.map((child, i) => (
        <View key={i} style={{ width: `${100 / columns}%`, paddingHorizontal: gap / 2, marginBottom: gap }}>
          {child}
        </View>
      ))}
    </View>
  );
}

/** أعمدة متوازية (كل عمود فيه مجموعة كروت) على الشاشات الكبيرة */
export function Columns({ children, wide, gap = 20 }: { children: ReactNode; wide: boolean; gap?: number }) {
  const items = Children.toArray(children).filter(Boolean);
  if (!wide) return <View style={{ gap }}>{items}</View>;
  return (
    <View style={[styles.columns, { gap }]}>
      {items.map((child, i) => (
        <View key={i} style={[styles.column, { gap }]}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  columns: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 0 },
});
