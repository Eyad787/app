import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevSettings, I18nManager, Platform } from 'react-native';

const RTL_RELOAD_KEY = '@masarefy/rtl-reloaded';

/**
 * بيفعّل اتجاه اليمين للشمال.
 * في نسخة الـ APK الإعداد ده متظبط من app.json (forcesRTL)،
 * لكن في Expo Go لازم نفعّله من الكود ونعيد تحميل التطبيق مرة واحدة.
 */
export async function ensureRTL(): Promise<void> {
  if (Platform.OS === 'web' || I18nManager.isRTL) return;
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);

  // نعيد التحميل مرة واحدة بس عشان مانقعش في لوب
  const alreadyReloaded = await AsyncStorage.getItem(RTL_RELOAD_KEY);
  if (alreadyReloaded) return;
  await AsyncStorage.setItem(RTL_RELOAD_KEY, '1');
  if (__DEV__) DevSettings.reload();
}
