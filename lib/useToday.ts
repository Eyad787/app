import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayKey } from './dates';
import type { DateKey } from './types';

/** تاريخ النهارده، وبيتحدث لما التطبيق يرجع من الخلفية (لو اليوم اتغير) */
export function useToday(): DateKey {
  const [today, setToday] = useState(todayKey);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(todayKey());
    });
    const timer = setInterval(() => setToday(todayKey()), 60_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);
  return today;
}
