import { get } from "@vercel/edge-config";

export interface SiteTheme {
  background?: string;
  primary?: string;
  secondary?: string;
  texture?: string;
  widgets?: Record<string, boolean>;
}

/**
 * Reads theme_<siteId> from shared Edge Config.
 * Returns null if no override is set — caller should use its own defaults.
 */
export async function loadSiteTheme(siteId: string): Promise<SiteTheme | null> {
  try {
    const theme = await get<SiteTheme>(`theme_${siteId}`);
    return theme ?? null;
  } catch {
    return null;
  }
}

/**
 * Generates a <style> tag string that injects CSS custom properties.
 * Drop into layout.tsx dangerouslySetInnerHTML to apply theme globally.
 *
 * Usage in layout.tsx:
 *   const theme = await loadSiteTheme("speakiq");
 *   const styleTag = buildThemeStyleTag(theme);
 *   // <style dangerouslySetInnerHTML={{ __html: styleTag }} />
 */
export function buildThemeStyleTag(theme: SiteTheme | null): string {
  if (!theme) return "";

  const vars: string[] = [];
  if (theme.background) vars.push(`--background: ${theme.background};`);
  if (theme.primary)    vars.push(`--theme-primary: ${theme.primary}; --color-primary: ${theme.primary};`);
  if (theme.secondary)  vars.push(`--theme-secondary: ${theme.secondary}; --color-secondary: ${theme.secondary};`);

  if (vars.length === 0) return "";

  return `:root { ${vars.join(" ")} }`;
}

/**
 * Checks if a specific widget is hidden for this site.
 * Default: all widgets shown unless explicitly set to false.
 */
export function isWidgetHidden(theme: SiteTheme | null, widgetKey: string): boolean {
  return theme?.widgets?.[widgetKey] === false;
}
