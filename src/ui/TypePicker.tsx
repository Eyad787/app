import { PHOTO_TYPES, type PhotoType } from "../photoTypes";
import { useI18n } from "./i18n";

export function TypePicker({ selected, onPick }: { selected?: PhotoType; onPick: (t: PhotoType) => void }) {
  const { t, lang } = useI18n();
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">{t.chooseType}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {PHOTO_TYPES.map((pt) => (
          <li key={pt.id}>
            <button
              onClick={() => onPick(pt)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white p-4 text-start transition hover:border-brand-600 ${
                selected?.id === pt.id ? "border-brand-700 ring-2 ring-brand-100" : "border-slate-200"
              }`}
            >
              <span className="font-semibold">{lang === "ar" ? pt.nameAr : pt.nameEn}</span>
              <span className="flex items-center gap-2 text-sm text-slate-500" dir="ltr">
                {t.sizeMm(pt.widthMm, pt.heightMm)}
                <span className="h-4 w-4 rounded border border-slate-300" style={{ background: pt.bgColor }} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
