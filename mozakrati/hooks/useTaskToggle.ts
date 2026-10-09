import { useCallback, useEffect, useRef, useState } from 'react';

import { useData } from '@/lib/db/DataProvider';
import type { Task } from '@/lib/types';

const LINGER_MS = 1200;

/**
 * لما المستخدم يعلّم على مهمة، بنسيبها في مكانها ثانية كده
 * علشان يشوف أنيميشن الصح قبل ما تختفي من القائمة.
 */
export function useTaskToggle() {
  const { data, toggleTask } = useData();
  const [lingering, setLingering] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toggle = useCallback(
    (task: Task) => {
      toggleTask(task.id);
      if (task.done) return;
      setLingering((p) => [...p, task.id]);
      timers.current.push(setTimeout(() => setLingering((p) => p.filter((id) => id !== task.id)), LINGER_MS));
    },
    [toggleTask],
  );

  /** المهام زي ما الفلاتر تشوفها (المهام اللي لسه متعلّم عليها تتعامل كأنها لسه مفتوحة) */
  const tasksForFilter = lingering.length
    ? data.tasks.map((t) => (lingering.includes(t.id) ? { ...t, done: false } : t))
    : data.tasks;

  /** بيرجّع النسخة الحقيقية من المهمة للعرض */
  const real = useCallback((t: Task) => data.tasks.find((x) => x.id === t.id) ?? t, [data.tasks]);

  return { toggle, tasksForFilter, real };
}
