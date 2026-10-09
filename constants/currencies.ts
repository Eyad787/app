export type CurrencyOption = { symbol: string; name: string };

export const DEFAULT_CURRENCY = 'ج.م';

export const CURRENCIES: CurrencyOption[] = [
  { symbol: 'ج.م', name: 'جنيه مصري' },
  { symbol: 'ر.س', name: 'ريال سعودي' },
  { symbol: 'د.إ', name: 'درهم إماراتي' },
  { symbol: 'د.ك', name: 'دينار كويتي' },
  { symbol: 'ر.ق', name: 'ريال قطري' },
  { symbol: 'د.أ', name: 'دينار أردني' },
  { symbol: '$', name: 'دولار أمريكي' },
  { symbol: '€', name: 'يورو' },
];
