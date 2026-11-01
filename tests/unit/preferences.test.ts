import { describe, it, expect } from 'vitest';
import { PreferencesEngine, DEFAULT_PRESETS } from '../../src/engines/preferences/PreferencesEngine';

describe('PreferencesEngine', () => {
  it('loads built-in default presets', () => {
    const engine = new PreferencesEngine();
    const active = engine.getActivePreset();
    expect(active).toBeTruthy();
    expect(active.id).toBe('rainy-evening');
    expect(active.sounds.length).toBeGreaterThan(0);
  });

  it('correctly encodes and decodes presets to/from URL hash', () => {
    const engine = new PreferencesEngine();
    const samplePreset = DEFAULT_PRESETS[0];

    const hash = engine.encodePresetToHash(samplePreset);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');

    const decoded = engine.decodePresetFromHash(`#p=${hash}`);
    expect(decoded).toBeTruthy();
    expect(decoded?.sceneId).toBe(samplePreset.sceneId);
    expect(decoded?.masterVolume).toBe(samplePreset.masterVolume);
    expect(decoded?.sounds?.length).toBe(samplePreset.sounds.length);
  });
});
