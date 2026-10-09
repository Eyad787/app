import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { getCategory } from '@/constants/categories';
import type { CategoryId } from '@/lib/types';

type Props = { category: CategoryId; size?: number };

export function CategoryIcon({ category, size = 46 }: Props) {
  const cat = getCategory(category);
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: `${cat.color}26` },
      ]}
    >
      <Ionicons name={cat.icon} size={size * 0.5} color={cat.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
