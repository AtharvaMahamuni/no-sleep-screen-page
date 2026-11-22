/**
 * Safe client-side analytics event dispatcher for Google Analytics 4.
 * Operates gracefully whether GA is active, ad-blocked, or opt-out is enabled.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  try {
    const prefs = localStorage.getItem('nosleep_prefs_v1');
    if (prefs && JSON.parse(prefs).analyticsOptOut) {
      return;
    }
  } catch {
    // Ignore storage parse errors
  }

  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    w.gtag('event', name, params);
  }
}
