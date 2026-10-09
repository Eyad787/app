import { I18nManager, Platform } from 'react-native';

/** الويب دايماً RTL (الصفحة dir="rtl")، والموبايل حسب إعداد RTL في app.json */
export const isRTL = Platform.OS === 'web' || I18nManager.isRTL;

/** حالة الضغط + hover (الـ hover موجود على الويب بس) */
export type PressState = import('react-native').PressableStateCallbackType & { hovered?: boolean };
