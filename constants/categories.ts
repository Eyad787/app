import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

import type { CategoryId } from '@/lib/types';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type Category = {
  id: CategoryId;
  label: string;
  icon: IconName;
  color: string;
};

export const CATEGORIES: Category[] = [
  { id: 'food', label: 'أكل', icon: 'fast-food', color: '#EB6834' },
  { id: 'transport', label: 'مواصلات', icon: 'bus', color: '#2A78D6' },
  { id: 'bills', label: 'فواتير', icon: 'receipt', color: '#6B5BD2' },
  { id: 'outing', label: 'خروج', icon: 'cafe', color: '#E87BA4' },
  { id: 'shopping', label: 'تسوق', icon: 'cart', color: '#1BAF7A' },
  { id: 'health', label: 'صحة', icon: 'medkit', color: '#E34948' },
  { id: 'education', label: 'تعليم', icon: 'school', color: '#EDA100' },
  { id: 'other', label: 'غيره', icon: 'ellipsis-horizontal-circle', color: '#8A939C' },
];

const BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export function getCategory(id: CategoryId): Category {
  return BY_ID[id] ?? BY_ID.other;
}

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
) as Record<CategoryId, string>;
