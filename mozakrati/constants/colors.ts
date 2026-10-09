export type ThemeColors = {
  background: string;
  card: string;
  cardAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  success: string;
  successSoft: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  background: '#F4F5FA',
  card: '#FFFFFF',
  cardAlt: '#EEF0F7',
  text: '#1C1E2B',
  textMuted: '#6B6F85',
  border: '#E1E3EE',
  primary: '#5B5BD6',
  primarySoft: '#E8E8FB',
  onPrimary: '#FFFFFF',
  danger: '#D93F4C',
  dangerSoft: '#FDE7E9',
  warning: '#C77A00',
  warningSoft: '#FFF2DC',
  success: '#1F9D6B',
  successSoft: '#DDF5EA',
  overlay: 'rgba(15, 17, 30, 0.45)',
};

export const darkColors: ThemeColors = {
  background: '#11131C',
  card: '#1B1E2B',
  cardAlt: '#242838',
  text: '#ECEDF5',
  textMuted: '#9A9EB6',
  border: '#2C3043',
  primary: '#8B8CF5',
  primarySoft: '#2A2B4D',
  onPrimary: '#11131C',
  danger: '#F2717B',
  dangerSoft: '#3A1F25',
  warning: '#F0B04A',
  warningSoft: '#3A2E19',
  success: '#4FCB97',
  successSoft: '#17352A',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

/** ألوان المواد: كل مادة بتاخد لون من دول */
export const SUBJECT_COLORS = [
  '#5B5BD6',
  '#E5484D',
  '#F76B15',
  '#E2A300',
  '#30A46C',
  '#12A594',
  '#0090FF',
  '#8E4EC6',
  '#D6409F',
  '#7C6F64',
  '#3E63DD',
  '#46A758',
] as const;

/** لون نص مقروء فوق لون المادة */
export const onSubjectColor = '#FFFFFF';

/** نسخة شفافة من لون (hex) */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${clean.slice(0, 6)}${a}`;
}
