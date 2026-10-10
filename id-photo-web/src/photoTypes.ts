/**
 * Every photo spec the site supports lives in this one file.
 *
 * Definitions used by the cropping code:
 * - headHeightRatio: (chin → top of hair) / photo height.
 * - eyeLineFromBottomRatio: (bottom edge → line through both eye centers) / photo height.
 * Both are [min, max]; the auto-crop aims for the middle of each range.
 *
 * ALL VALUES BELOW ARE PLACEHOLDERS until checked against the issuing authority.
 */
export interface PhotoType {
  id: string;
  /** URL path of the static SEO page for this type, e.g. "/passport-photo". */
  slug: string;
  nameAr: string;
  nameEn: string;
  widthMm: number;
  heightMm: number;
  /** CSS hex color of the required background. */
  bgColor: string;
  headHeightRatio: [number, number];
  eyeLineFromBottomRatio: [number, number];
  /** Upper limit for online uploads, if the authority publishes one. */
  maxFileKb?: number;
  notesAr: string;
  notesEn: string;
}

/** Print resolution used for the single photo and the print sheet. */
export const PRINT_DPI = 300;

export const PHOTO_TYPES: PhotoType[] = [
  {
    id: "egypt-passport",
    slug: "/passport-photo",
    nameAr: "جواز السفر المصري",
    nameEn: "Egyptian passport",
    widthMm: 40, // TODO: verify from official source
    heightMm: 60, // TODO: verify from official source
    bgColor: "#ffffff", // TODO: verify from official source
    headHeightRatio: [0.5, 0.6], // TODO: verify from official source
    eyeLineFromBottomRatio: [0.58, 0.66], // TODO: verify from official source
    maxFileKb: 200, // TODO: verify from official source
    notesAr: "خلفية بيضاء، وش واضح من غير نضارة شمس، وبصّ للكاميرا مباشرة.", // TODO: verify from official source
    notesEn: "White background, face clearly visible, no sunglasses, looking straight at the camera.", // TODO: verify from official source
  },
  {
    id: "egypt-national-id",
    slug: "/id-photo",
    nameAr: "بطاقة الرقم القومي",
    nameEn: "Egyptian national ID",
    widthMm: 40, // TODO: verify from official source
    heightMm: 60, // TODO: verify from official source
    bgColor: "#ffffff", // TODO: verify from official source
    headHeightRatio: [0.5, 0.6], // TODO: verify from official source
    eyeLineFromBottomRatio: [0.58, 0.66], // TODO: verify from official source
    maxFileKb: 200, // TODO: verify from official source
    notesAr: "خلفية بيضاء، تعبير وش طبيعي، والراس في نص الصورة.", // TODO: verify from official source
    notesEn: "White background, neutral expression, head centered.", // TODO: verify from official source
  },
  {
    id: "university",
    slug: "/university-photo",
    nameAr: "تقديم الجامعة",
    nameEn: "University application",
    widthMm: 40, // TODO: verify from official source
    heightMm: 60, // TODO: verify from official source
    bgColor: "#ffffff", // TODO: verify from official source
    headHeightRatio: [0.5, 0.6], // TODO: verify from official source
    eyeLineFromBottomRatio: [0.58, 0.66], // TODO: verify from official source
    maxFileKb: 100, // TODO: verify from official source
    notesAr: "راجع شروط الكلية أو موقع التنسيق قبل الرفع.", // TODO: verify from official source
    notesEn: "Check your faculty / admissions portal requirements before uploading.", // TODO: verify from official source
  },
  {
    id: "schengen-visa",
    slug: "/schengen-visa-photo",
    nameAr: "فيزا شنغن",
    nameEn: "Schengen visa",
    widthMm: 35, // TODO: verify from official source
    heightMm: 45, // TODO: verify from official source
    bgColor: "#f2f2f2", // TODO: verify from official source
    headHeightRatio: [0.71, 0.8], // TODO: verify from official source
    eyeLineFromBottomRatio: [0.56, 0.68], // TODO: verify from official source
    notesAr: "خلفية فاتحة (أبيض أو رمادي فاتح)، والوش ياخد ٧٠–٨٠٪ من طول الصورة.", // TODO: verify from official source
    notesEn: "Light plain background; the face fills 70–80% of the photo height.", // TODO: verify from official source
  },
  {
    id: "us-visa",
    slug: "/us-visa-photo",
    nameAr: "الفيزا الأمريكية",
    nameEn: "US visa",
    widthMm: 50.8, // TODO: verify from official source (2 inch)
    heightMm: 50.8, // TODO: verify from official source (2 inch)
    bgColor: "#ffffff", // TODO: verify from official source
    headHeightRatio: [0.5, 0.69], // TODO: verify from official source
    eyeLineFromBottomRatio: [0.56, 0.69], // TODO: verify from official source
    maxFileKb: 240, // TODO: verify from official source
    notesAr: "مقاس ٢×٢ بوصة، خلفية بيضاء، ومن غير نضارة.", // TODO: verify from official source
    notesEn: "2×2 inch, white background, no eyeglasses.", // TODO: verify from official source
  },
];

export function getPhotoType(id: string): PhotoType | undefined {
  return PHOTO_TYPES.find((t) => t.id === id);
}

export function getPhotoTypeBySlug(slug: string): PhotoType | undefined {
  return PHOTO_TYPES.find((t) => t.slug === slug);
}

/** Output pixel size of one photo at PRINT_DPI. */
export function pixelSize(type: PhotoType): { width: number; height: number } {
  return {
    width: Math.round((type.widthMm / 25.4) * PRINT_DPI),
    height: Math.round((type.heightMm / 25.4) * PRINT_DPI),
  };
}

export function midpoint([min, max]: [number, number]): number {
  return (min + max) / 2;
}
