import type { SupportedLocale } from './ui';
import { DEFAULT_LOCALE, LOCALES, UI_STRINGS } from './ui';

export function useTranslations(lang: SupportedLocale = DEFAULT_LOCALE) {
  return function t(key: string): string {
    return UI_STRINGS[lang]?.[key] ?? UI_STRINGS[DEFAULT_LOCALE]?.[key] ?? key;
  };
}

export function getLocaleFromUrl(url: URL | string): SupportedLocale {
  const pathname = typeof url === 'string' ? url : url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && first in LOCALES) {
    return first as SupportedLocale;
  }
  return DEFAULT_LOCALE;
}

export function getLocalizedPath(path: string, targetLocale: SupportedLocale): string {
  const currentLocale = getLocaleFromUrl(path);
  let cleanPath = path;

  if (currentLocale !== DEFAULT_LOCALE) {
    cleanPath = path.replace(new RegExp(`^/${currentLocale}`), '');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  }

  // Ensure trailing slash per Astro trailingSlash: 'always'
  if (!cleanPath.endsWith('/')) {
    cleanPath = cleanPath + '/';
  }

  // Main tool pages map directly to each locale equivalent
  if (cleanPath === '/') {
    if (targetLocale === DEFAULT_LOCALE) {
      return '/';
    }
    return `/${targetLocale}/`;
  }

  // For pages only in English (about, privacy, sounds/*, 404),
  // sending user to another locale routes to that locale's main tool
  if (targetLocale === DEFAULT_LOCALE) {
    return cleanPath;
  }
  return `/${targetLocale}/`;
}

export function hasMultilingualAlternates(path: string): boolean {
  const currentLocale = getLocaleFromUrl(path);
  let cleanPath = path;
  if (currentLocale !== DEFAULT_LOCALE) {
    cleanPath = path.replace(new RegExp(`^/${currentLocale}`), '');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  }
  if (!cleanPath.endsWith('/')) cleanPath += '/';
  return cleanPath === '/';
}
