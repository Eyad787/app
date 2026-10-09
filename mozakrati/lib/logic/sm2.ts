import type { DateKey } from '@/lib/types';

import { addDays } from './dates';

/**
 * خوارزمية SM-2 للتكرار المتباعد (بطاقات المراجعة – المرحلة 3).
 * أزرار المستخدم: صعب / تمام / سهل.
 */

export type ReviewAnswer = 'hard' | 'good' | 'easy';

export type CardSchedule = {
  /** معامل السهولة (يبدأ من 2.5 وأقله 1.3) */
  ease: number;
  /** الفاصل بالأيام */
  interval: number;
  /** عدد المراجعات الصح المتتالية */
  repetitions: number;
  due: DateKey;
};

const QUALITY: Record<ReviewAnswer, number> = { hard: 2, good: 4, easy: 5 };

export function newCard(today: DateKey): CardSchedule {
  return { ease: 2.5, interval: 0, repetitions: 0, due: today };
}

export function review(card: CardSchedule, answer: ReviewAnswer, today: DateKey): CardSchedule {
  const q = QUALITY[answer];
  const ease = Math.max(1.3, Math.round((card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))) * 100) / 100);
  let repetitions: number;
  let interval: number;
  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions = card.repetitions + 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(card.interval * ease);
    if (answer === 'easy' && repetitions <= 2) interval += 1;
  }
  return { ease, interval, repetitions, due: addDays(today, interval) };
}

export function isDue(card: CardSchedule, today: DateKey): boolean {
  return card.due <= today;
}
