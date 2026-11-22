// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { trackEvent } from '../../src/engines/analytics';

describe('Analytics Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it('safely no-ops when gtag is not defined', () => {
    expect(() => trackEvent('test_event', { foo: 'bar' })).not.toThrow();
  });

  it('dispatches events to window.gtag when available', () => {
    const mockGtag = vi.fn();
    (window as unknown as { gtag: typeof mockGtag }).gtag = mockGtag;

    trackEvent('wake_lock_toggle', { status: 'active' });

    expect(mockGtag).toHaveBeenCalledWith('event', 'wake_lock_toggle', { status: 'active' });
  });

  it('respects analyticsOptOut preference from localStorage', () => {
    const mockGtag = vi.fn();
    (window as unknown as { gtag: typeof mockGtag }).gtag = mockGtag;

    localStorage.setItem(
      'nosleep_prefs_v1',
      JSON.stringify({ version: 1, analyticsOptOut: true })
    );

    trackEvent('wake_lock_toggle', { status: 'active' });

    expect(mockGtag).not.toHaveBeenCalled();
  });
});
