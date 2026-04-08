/**
 * Label color on solid habit-color backgrounds (calendar / year overview cells).
 * Expects 6-digit #RRGGBB; non-hex strings fall back to white text.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace("#", "");
  if (h.length !== 6) {
    return null;
  }
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }
  return { r, g, b };
}

/** WCAG relative luminance (sRGB), 0–1. */
function relativeLuminance(r: number, g: number, b: number): number {
  const linear = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(lumBg: number, lumFg: number): number {
  const lighter = Math.max(lumBg, lumFg);
  const darker = Math.min(lumBg, lumFg);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Picks #fff or #111827 for maximum contrast on a solid hex background. */
export function completedLabelColor(backgroundHex: string): string {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) {
    return "#ffffff";
  }
  const Lbg = relativeLuminance(rgb.r, rgb.g, rgb.b);
  const Lwhite = relativeLuminance(255, 255, 255);
  const Lblack = relativeLuminance(17, 24, 39); // #111827
  const whiteOnBg = contrastRatio(Lbg, Lwhite);
  const blackOnBg = contrastRatio(Lbg, Lblack);
  return whiteOnBg >= blackOnBg ? "#ffffff" : "#111827";
}
