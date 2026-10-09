import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { toDateKey } from '@/lib/logic/dates';

/**
 * الوقت الحالي، بيتحدث كل intervalMs ولما التطبيق يرجع من الخلفية.
 * مفيد لتمييز المحاضرة الحالية وتغيير "النهارده" بعد نص الليل.
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(new Date());
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [intervalMs]);
  return now;
}

export function useToday(): string {
  return toDateKey(useNow(60_000));
}
