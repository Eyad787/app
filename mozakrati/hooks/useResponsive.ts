import { useWindowDimensions } from 'react-native';

import { WIDE_BREAKPOINT } from '@/constants/layout';

/** معلومات الشاشة: موبايل (عمود واحد) ولا لاب توب (أعمدة متعددة + قائمة جانبية) */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;
  const columns = width >= 1400 ? 3 : width >= 700 ? 2 : 1;
  return { width, height, isWide, columns };
}
