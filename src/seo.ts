// Page titles and descriptions. Imported by the app and by scripts/prerender.mjs,
// so it must stay plain TypeScript with no browser or Vite APIs.
import { PHOTO_TYPES, type PhotoType } from "./photoTypes.ts";

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  h1: string;
}

export const HOME_META: PageMeta = {
  path: "/",
  title: "صورة باسبور وبطاقة أونلاين مجانًا | صورة رسمية من السيلفي",
  description:
    "اعمل صورة باسبور أو بطاقة رقم قومي أو فيزا من موبايلك مجانًا: إزالة الخلفية وضبط المقاس تلقائيًا، وورقة طباعة ٤×٦ جاهزة لأي محل تصوير. صورتك مش بتترفع على أي سيرفر.",
  h1: "صورة باسبور وبطاقة أونلاين مجانًا",
};

const TYPE_TITLES: Record<string, { title: string; description: string }> = {
  "egypt-passport": {
    title: "صورة جواز سفر مصري أونلاين مجانًا | خلفية بيضاء ومقاس مظبوط",
    description: "اعمل صورة جواز السفر المصري من السيلفي: خلفية بيضاء ومقاس مظبوط، وحمّلها JPG أو ورقة طباعة ٤×٦ — من غير ما الصورة تخرج من موبايلك.",
  },
  "egypt-national-id": {
    title: "صورة بطاقة الرقم القومي أونلاين مجانًا | صورة ٤×٦ خلفية بيضاء",
    description: "صورة بطاقة رقم قومي من موبايلك في ثواني: إزالة الخلفية وضبط المقاس وورقة طباعة جاهزة. مجانًا وبدون رفع على سيرفر.",
  },
  university: {
    title: "صورة تقديم الجامعة والتنسيق أونلاين مجانًا",
    description: "جهّز صورتك الشخصية لتقديم الجامعة أو التنسيق بالمقاس والحجم المطلوب، وحمّلها بحجم ملف صغير مناسب للرفع.",
  },
  "schengen-visa": {
    title: "صورة فيزا شنغن ٣٥×٤٥ مم أونلاين مجانًا",
    description: "صورة فيزا شنغن مقاس ٣٥×٤٥ مم من السيلفي: الوش بالنسبة المطلوبة وخلفية فاتحة، وورقة طباعة ١٠×١٥ سم.",
  },
  "us-visa": {
    title: "صورة الفيزا الأمريكية ٢×٢ بوصة أونلاين مجانًا",
    description: "صورة الفيزا الأمريكية مقاس ٢×٢ بوصة بخلفية بيضاء، وملف JPG بالحجم المناسب للرفع على DS-160.",
  },
};

export function typeMeta(type: PhotoType): PageMeta {
  const m = TYPE_TITLES[type.id] ?? {
    title: `صورة ${type.nameAr} أونلاين مجانًا`,
    description: `اعمل صورة ${type.nameAr} من موبايلك مجانًا.`,
  };
  return { path: type.slug, title: m.title, description: m.description, h1: `صورة ${type.nameAr}` };
}

export const ALL_PAGES: PageMeta[] = [HOME_META, ...PHOTO_TYPES.map(typeMeta)];
