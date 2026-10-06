// Accent-uniqueness guard for PATCH /api/themes. Mirrors design-system/scripts/check-palettes.mjs.
const MIN_DE = 0.04;

function oklab(hex: string): number[] {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Returns site ids whose accent is too close to `primary`, or [] if unique / shared allowed. */
export function accentCollisions(
  siteId: string,
  theme: { primary?: string; design?: { paletteShared?: boolean } },
  others: Record<string, { primary?: string; design?: { paletteShared?: boolean } }>,
): string[] {
  if (theme.design?.paletteShared || !theme.primary || !HEX.test(theme.primary)) return [];
  const a = oklab(theme.primary);
  return Object.entries(others)
    .filter(([id, t]) => id !== siteId && t.primary && HEX.test(t.primary))
    .filter(([, t]) => Math.hypot(...oklab(t.primary!).map((v, i) => v - a[i])) < MIN_DE)
    .map(([id]) => id);
}
