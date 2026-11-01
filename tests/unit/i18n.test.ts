import { describe, it, expect } from 'vitest';
import { LOCALES, DEFAULT_LOCALE } from '../../src/i18n/ui';
import { useTranslations, getLocaleFromUrl, getLocalizedPath } from '../../src/i18n/utils';

describe('i18n Multi-Language Module', () => {
  it('supports all 7 required global locales', () => {
    const supported = Object.keys(LOCALES);
    expect(supported).toContain('en');
    expect(supported).toContain('es');
    expect(supported).toContain('de');
    expect(supported).toContain('fr');
    expect(supported).toContain('pt');
    expect(supported).toContain('ja');
    expect(supported).toContain('zh');
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('translates core UI keys across all supported locales', () => {
    for (const locale of Object.keys(LOCALES) as (keyof typeof LOCALES)[]) {
      const t = useTranslations(locale);
      expect(t('site.title')).toBeTruthy();
      expect(t('wakelock.idle')).toBeTruthy();
      expect(t('sound.mixer')).toBeTruthy();
      expect(t('timer.start')).toBeTruthy();
    }
  });

  it('parses locale correctly from URL paths', () => {
    expect(getLocaleFromUrl('/')).toBe('en');
    expect(getLocaleFromUrl('/es/')).toBe('es');
    expect(getLocaleFromUrl('/de/')).toBe('de');
    expect(getLocaleFromUrl('/ja/')).toBe('ja');
    expect(getLocaleFromUrl('/unknown/')).toBe('en');
  });

  it('generates accurate localized paths with trailing slashes', () => {
    expect(getLocalizedPath('/', 'es')).toBe('/es/');
    expect(getLocalizedPath('/', 'en')).toBe('/');
    expect(getLocalizedPath('/es/', 'en')).toBe('/');
    expect(getLocalizedPath('/es/', 'de')).toBe('/de/');
    expect(getLocalizedPath('/sounds/rain/', 'fr')).toBe('/fr/');
  });
});
