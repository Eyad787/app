/**
 * الإشعارات على المتصفح (اختيارية).
 * لو المتصفح بيدعم Notification API والمستخدم وافق، بنظهر إشعار لما الجلسة تخلص والصفحة مفتوحة.
 * لو مش مدعومة، التطبيق بيشتغل عادي من غيرها.
 */
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const supported = () => typeof window !== 'undefined' && 'Notification' in window;

export function configureNotifications() {}

export async function ensurePermission(): Promise<boolean> {
  if (!supported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleAt(when: number, title: string, body: string, _kind: string): Promise<string | null> {
  if (!supported() || when <= Date.now()) return null;
  const id = `${when}-${Math.random().toString(36).slice(2)}`;
  timers.set(
    id,
    setTimeout(() => {
      timers.delete(id);
      // لو الصفحة قدام المستخدم، المؤقت نفسه بيشغّل الصوت
      if (Notification.permission !== 'granted' || document.visibilityState === 'visible') return;
      try {
        new Notification(title, { body, icon: `${process.env.EXPO_BASE_URL ?? ''}/icons/icon-192.png`, lang: 'en', dir: 'ltr' });
      } catch {
        // بعض المتصفحات (زي كروم على أندرويد) محتاجة service worker للإشعارات
      }
    }, when - Date.now()),
  );
  return id;
}

export async function cancelScheduled(id: string | null) {
  if (!id) return;
  const t = timers.get(id);
  if (t) clearTimeout(t);
  timers.delete(id);
}

export async function cancelKind(_kind: string) {}
