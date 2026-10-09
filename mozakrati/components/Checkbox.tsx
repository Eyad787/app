import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet } from 'react-native';

import { useColors } from '@/hooks/useTheme';
import { tapFeedback } from '@/lib/feedback';

type Props = { checked: boolean; onToggle: () => void; color?: string; label: string; size?: number };

/** علامة صح بأنيميشن بسيط (نطّة صغيرة لما تتعلّم) */
export function Checkbox({ checked, onToggle, color, label, size = 28 }: Props) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  const tint = color ?? colors.primary;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!checked) return;
    scale.setValue(0.6);
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 160, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [checked, scale]);

  return (
    <Pressable
      onPress={() => {
        tapFeedback();
        onToggle();
      }}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: checked ? tint : colors.textMuted,
            backgroundColor: checked ? tint : 'transparent',
            transform: [{ scale }],
          },
        ]}
      >
        {checked ? <Ionicons name="checkmark" size={size * 0.68} color="#FFFFFF" /> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
