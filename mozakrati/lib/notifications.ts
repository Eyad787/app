/**
 * الإشعارات على الموبايل (expo-notifications – إشعارات محلية بتشتغل على Expo Go).
 * دلوقتي بتتستخدم لإشعار انتهاء جلسة البومودورو،
 * وفي المرحلة 2 هتتستخدم لتذكيرات المحاضرات والامتحانات والتسليمات.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const POMODORO_CHANNEL = 'pomodoro';
let configured = false;

export function configureNotifications() {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async (n) => {
      // وإحنا فاتحين التطبيق، المؤقت نفسه بيشغّل الصوت فمش محتاجين بانر
      const isPomodoro = n.request.content.data?.kind === 'pomodoro';
      return {
        shouldShowBanner: !isPomodoro,
        shouldShowList: true,
        shouldPlaySound: !isPomodoro,
        shouldSetBadge: false,
      };
    },
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(POMODORO_CHANNEL, {
      name: 'مؤقت المذاكرة',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 150, 300],
      sound: 'default',
    }).catch(() => undefined);
  }
}

export async function ensurePermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

/** إشعار في وقت محدد. بيرجّع المعرّف علشان نقدر نلغيه */
export async function scheduleAt(when: number, title: string, body: string, kind: string): Promise<string | null> {
  if (when <= Date.now()) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default', data: { kind } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(when),
        channelId: POMODORO_CHANNEL,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelScheduled(id: string | null) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // مش مهم
  }
}

/** بيلغي كل الإشعارات المتجدولة من نوع معين (مثلاً بعد ما التطبيق يفتح من جديد) */
export async function cancelKind(kind: string) {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      all
        .filter((n) => n.content.data?.kind === kind)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // مش مهم
  }
}
