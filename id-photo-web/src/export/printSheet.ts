import { PRINT_DPI } from "../photoTypes";
import { toJpeg } from "./encode";

/** 10×15 cm (4×6 in) photo paper. */
export const SHEET_MM = { width: 100, height: 150 };
const mmToPx = (mm: number) => Math.round((mm / 25.4) * PRINT_DPI);
export const SHEET_PX = { width: mmToPx(SHEET_MM.width), height: mmToPx(SHEET_MM.height) }; // 1181 × 1772

const GAP_PX = mmToPx(2);
const MARGIN_PX = mmToPx(3);

export interface SheetLayout {
  cols: number;
  rows: number;
  /** Photos rotated 90° to fit more per sheet. */
  rotated: boolean;
}

function fit(pw: number, ph: number): { cols: number; rows: number } {
  const usableW = SHEET_PX.width - 2 * MARGIN_PX + GAP_PX;
  const usableH = SHEET_PX.height - 2 * MARGIN_PX + GAP_PX;
  return { cols: Math.floor(usableW / (pw + GAP_PX)), rows: Math.floor(usableH / (ph + GAP_PX)) };
}

export function planSheet(photoW: number, photoH: number): SheetLayout {
  const up = fit(photoW, photoH);
  const side = fit(photoH, photoW);
  return side.cols * side.rows > up.cols * up.rows ? { ...side, rotated: true } : { ...up, rotated: false };
}

export function renderSheet(photo: HTMLCanvasElement): { canvas: HTMLCanvasElement; count: number } {
  const plan = planSheet(photo.width, photo.height);
  const cellW = plan.rotated ? photo.height : photo.width;
  const cellH = plan.rotated ? photo.width : photo.height;
  const c = document.createElement("canvas");
  c.width = SHEET_PX.width;
  c.height = SHEET_PX.height;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);

  // Center the grid on the sheet.
  const gridW = plan.cols * cellW + (plan.cols - 1) * GAP_PX;
  const gridH = plan.rows * cellH + (plan.rows - 1) * GAP_PX;
  const x0 = Math.round((c.width - gridW) / 2);
  const y0 = Math.round((c.height - gridH) / 2);

  // Thin cut lines along every photo edge, running across the whole sheet.
  ctx.strokeStyle = "#b0b0b0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let col = 0; col < plan.cols; col++) {
    for (const x of [x0 + col * (cellW + GAP_PX) - 0.5, x0 + col * (cellW + GAP_PX) + cellW + 0.5]) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, c.height);
    }
  }
  for (let r = 0; r < plan.rows; r++) {
    for (const y of [y0 + r * (cellH + GAP_PX) - 0.5, y0 + r * (cellH + GAP_PX) + cellH + 0.5]) {
      ctx.moveTo(0, y);
      ctx.lineTo(c.width, y);
    }
  }
  ctx.stroke();
  // Photos go on top, so the lines only show in the gaps and margins.
  for (let r = 0; r < plan.rows; r++) {
    for (let col = 0; col < plan.cols; col++) {
      const x = x0 + col * (cellW + GAP_PX);
      const y = y0 + r * (cellH + GAP_PX);
      ctx.save();
      if (plan.rotated) {
        ctx.translate(x + cellW, y);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(photo, 0, 0);
      } else {
        ctx.drawImage(photo, x, y);
      }
      ctx.restore();
    }
  }
  return { canvas: c, count: plan.cols * plan.rows };
}

export async function sheetToPdf(sheet: HTMLCanvasElement): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: [SHEET_MM.width, SHEET_MM.height], orientation: "portrait" });
  const jpeg = new Uint8Array(await (await toJpeg(sheet, 0.95)).arrayBuffer());
  doc.addImage(jpeg, "JPEG", 0, 0, SHEET_MM.width, SHEET_MM.height);
  return doc.output("blob");
}
