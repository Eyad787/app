import { I18nManager } from 'react-native';

/** اتجاه الواجهة: التطبيق إنجليزي (LTR)، بس بنقرا الإعداد علشان لو اتغيّر بعدين */
export const isRTL = I18nManager.isRTL;

/** حالة الضغط + hover (الـ hover موجود على الويب بس) */
export type PressState = import('react-native').PressableStateCallbackType & { hovered?: boolean };
