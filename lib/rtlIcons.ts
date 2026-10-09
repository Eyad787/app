import { I18nManager } from 'react-native';

type ChevronName = 'chevron-forward' | 'chevron-back';

/** الأيقونات مابتتقلبش لوحدها في RTL، فبنختار الاتجاه الصح يدوي */
export const prevIcon = (): ChevronName => (I18nManager.isRTL ? 'chevron-forward' : 'chevron-back');
export const nextIcon = (): ChevronName => (I18nManager.isRTL ? 'chevron-back' : 'chevron-forward');
