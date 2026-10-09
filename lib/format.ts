const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** بيحوّل الأرقام العربية/الفارسية لأرقام إنجليزي ويوحّد علامة العشري */
export function normalizeDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (ch) => String(ARABIC_DIGITS.indexOf(ch)))
    .replace(/[۰-۹]/g, (ch) => String(PERSIAN_DIGITS.indexOf(ch)))
    .replace(/[٫,،]/g, '.')
    .replace(/[٬\s]/g, '');
}

/** بيحلل المبلغ المكتوب؛ بيرجّع null لو مش رقم صحيح أكبر من صفر */
export function parseAmount(input: string): number | null {
  const normalized = normalizeDigits(input.trim());
  if (!/^\d+(\.\d+)?$|^\.\d+$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

/** بينضّف النص اللي بيتكتب في خانة المبلغ: أرقام وعلامة عشرية واحدة ورقمين بعدها بالكتير */
export function sanitizeAmountInput(input: string): string {
  const normalized = normalizeDigits(input).replace(/[^\d.]/g, '');
  const [intPart, ...rest] = normalized.split('.');
  if (rest.length === 0) return intPart;
  return `${intPart}.${rest.join('').slice(0, 2)}`;
}

export function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const hasFraction = Math.abs(rounded % 1) > 0.0001;
  const fixed = rounded.toFixed(hasFraction ? 2 : 0);
  const [intPart, frac] = fixed.split('.');
  const sign = intPart.startsWith('-') ? '-' : '';
  const digits = sign ? intPart.slice(1) : intPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${grouped}${frac ? `.${frac}` : ''}`;
}

export function formatMoney(value: number, currency: string): string {
  return `${formatNumber(value)} ${currency}`;
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}
