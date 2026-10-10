import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { IssueCode } from "../faceAnalysis/quality";

export type Lang = "ar" | "en";

const ar = {
  siteName: "صورة رسمية",
  ctaStart: "صوّر أو ارفع صورة",
  heroTitle: "صورة باسبور وبطاقة أونلاين مجانًا",
  typeHeroTitle: (name: string) => `صورة ${name} أونلاين مجانًا`,
  heroSubtitle: "صوّر سيلفي، وإحنا نشيل الخلفية ونظبط المقاس حسب نوع الصورة — في ثواني.",
  privacyBadge: "صورتك بتتعالج على جهازك ومش بتترفع على أي سيرفر",
  disclaimer: "الصورة بتتعمل حسب المواصفات المنشورة، لكن القبول النهائي بيرجع للجهة اللي هتقدّم لها.",
  chooseType: "اختار نوع الصورة",
  sizeMm: (w: number, h: number) => `${w}×${h} مم`,
  howToGetPhoto: "عايز تجيب الصورة إزاي؟",
  useCamera: "افتح الكاميرا",
  uploadPhoto: "ارفع صورة من الجهاز",
  tipsTitle: "عشان تطلع أحسن صورة",
  tips: ["قف قدام حيطة فاتحة ونورها حلو", "بُص للكاميرا مباشرة والراس مستقيمة", "شيل النضارة لو فيها لمعة", "خلي بين الكاميرا ووشك حوالي طول دراع"],
  loadingModels: "بنحمّل أدوات تحليل الصورة… (أول مرة بس)",
  processing: "بنشيل الخلفية ونظبط المقاس…",
  modelsFailed: "معرفناش نحمّل أدوات التحليل. اتأكد من النت وجرّب تاني.",
  retry: "جرّب تاني",
  back: "رجوع",
  startOver: "ابدأ من الأول",
  capture: "التقط الصورة",
  cameraDenied: "مش قادرين نفتح الكاميرا. اسمح للموقع باستخدام الكاميرا أو ارفع صورة بدالها.",
  lookingGood: "تمام كده! اثبت والتقط الصورة",
  issues: {
    noFace: "مش لاقيين وش في الصورة",
    multipleFaces: "في أكتر من وش في الصورة — لازم تكون لوحدك",
    tilted: "راسك مايلة شوية — خليها مستقيمة",
    tooSmall: "قرّب من الكاميرا شوية",
    tooLarge: "بعّد عن الكاميرا شوية",
    tooDark: "الصورة ضلمة — دوّر على مكان منوّر أكتر",
    tooBright: "النور جامد أوي على وشك",
    blurry: "الصورة مهزوزة أو مش واضحة",
    headCutOff: "أعلى راسك مقطوع في الصورة — صوّر تاني وسيب مسافة فوق راسك",
    lowResolution: "دقة الصورة قليلة — ممكن تطلع مش واضحة في الطباعة",
  } satisfies Record<IssueCode, string>,
  noFaceHelp: "جرّب صورة تانية يكون فيها وشك واضح ومتجه للكاميرا.",
  preview: "المعاينة",
  adjust: "تعديلات يدوية",
  zoom: "تكبير",
  moveX: "يمين / شمال",
  moveY: "فوق / تحت",
  rotate: "لفّ",
  brightness: "الإضاءة",
  reset: "رجّع الإعدادات",
  photoType: "نوع الصورة",
  headHeight: "طول الراس",
  eyeLine: "مستوى العين",
  withinSpec: "مطابق",
  outsideSpec: "برّه المواصفات",
  exportSingle: "صورة واحدة (للتقديم أونلاين)",
  maxSize: "أقصى حجم للملف",
  fileInfo: (kb: number, q: number) => `الحجم ${kb} ك.ب — الجودة ${q}%`,
  tooBigForLimit: "مش قادرين نوصل للحجم ده من غير ما الصورة تبوظ. زوّد الحد شوية.",
  downloadJpg: "تحميل الصورة JPG",
  exportSheet: "ورقة طباعة ١٠×١٥ سم",
  sheetInfo: (n: number) => `${n} صور على ورقة ٤×٦ — اطبعها في أي محل تصوير`,
  downloadSheetJpg: "تحميل الورقة JPG",
  downloadSheetPdf: "تحميل الورقة PDF",
  preparing: "بنجهّز…",
  langToggle: "English",
  notes: "ملاحظات",
  footerSpecs: "المواصفات قابلة للتغيير — راجع الجهة الرسمية دايمًا.",
};

type Strings = typeof ar;

const en: Strings = {
  siteName: "Official Photo",
  ctaStart: "Take or upload a photo",
  heroTitle: "Free online passport & ID photos",
  typeHeroTitle: (name) => `${name} photo online — free`,
  heroSubtitle: "Take a selfie — we remove the background and crop it to the right size in seconds.",
  privacyBadge: "Your photo is processed on your device and never uploaded to any server",
  disclaimer: "Photos follow the published specs, but final acceptance is up to the issuing authority.",
  chooseType: "Choose photo type",
  sizeMm: (w, h) => `${w}×${h} mm`,
  howToGetPhoto: "How do you want to add your photo?",
  useCamera: "Open camera",
  uploadPhoto: "Upload from device",
  tipsTitle: "For the best result",
  tips: ["Stand in front of a plain, light wall with good light", "Look straight at the camera, head level", "Remove glasses if they reflect light", "Hold the camera about an arm's length away"],
  loadingModels: "Loading photo analysis tools… (first time only)",
  processing: "Removing background and cropping…",
  modelsFailed: "Couldn't load the analysis tools. Check your connection and try again.",
  retry: "Try again",
  back: "Back",
  startOver: "Start over",
  capture: "Capture",
  cameraDenied: "We can't open the camera. Allow camera access or upload a photo instead.",
  lookingGood: "Looks good! Hold still and capture",
  issues: {
    noFace: "No face detected",
    multipleFaces: "More than one face — you need to be alone in the photo",
    tilted: "Your head is tilted — keep it level",
    tooSmall: "Move a little closer",
    tooLarge: "Move a little further away",
    tooDark: "Too dark — find a brighter spot",
    tooBright: "Too much light on your face",
    blurry: "The photo is blurry",
    headCutOff: "The top of your head is cut off — retake with space above your head",
    lowResolution: "Low resolution — the print may look soft",
  },
  noFaceHelp: "Try another photo where your face is clear and facing the camera.",
  preview: "Preview",
  adjust: "Manual adjustments",
  zoom: "Zoom",
  moveX: "Left / right",
  moveY: "Up / down",
  rotate: "Rotate",
  brightness: "Brightness",
  reset: "Reset",
  photoType: "Photo type",
  headHeight: "Head height",
  eyeLine: "Eye line",
  withinSpec: "OK",
  outsideSpec: "Out of spec",
  exportSingle: "Single photo (for online applications)",
  maxSize: "Max file size",
  fileInfo: (kb, q) => `Size ${kb} KB — quality ${q}%`,
  tooBigForLimit: "Can't reach that size without ruining the photo. Raise the limit a bit.",
  downloadJpg: "Download JPG",
  exportSheet: "10×15 cm print sheet",
  sheetInfo: (n) => `${n} photos on a 4×6 sheet — print at any photo shop`,
  downloadSheetJpg: "Download sheet JPG",
  downloadSheetPdf: "Download sheet PDF",
  preparing: "Preparing…",
  langToggle: "العربية",
  notes: "Notes",
  footerSpecs: "Specs can change — always check with the official authority.",
};

const STRINGS: Record<Lang, Strings> = { ar, en };

interface I18n {
  lang: Lang;
  t: Strings;
  toggle: () => void;
}

const Ctx = createContext<I18n | null>(null);

function initialLang(): Lang {
  try {
    if (localStorage.getItem("lang") === "en") return "en";
  } catch {
    /* storage unavailable */
  }
  return "ar";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("lang", lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang]);
  const toggle = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  return <Ctx.Provider value={{ lang, t: STRINGS[lang], toggle }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside provider");
  return v;
}
