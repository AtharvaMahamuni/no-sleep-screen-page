import { describe, it, expect, beforeEach } from 'vitest';
import { TimerManager } from '../../src/engines/session/TimerManager';

describe('TimerManager', () => {
  let timer: TimerManager;

  beforeEach(() => {
    timer = new TimerManager();
  });

  it('initializes to 25 minutes Pomodoro by default', () => {
    const state = timer.getState();
    expect(state.mode).toBe('pomodoro');
    expect(state.totalSeconds).toBe(25 * 60);
    expect(state.formattedTime).toBe('25:00');
    expect(state.isRunning).toBe(false);
  });

  it('correctly switches to short break mode (5 minutes)', () => {
    timer.setMode('shortBreak');
    const state = timer.getState();
    expect(state.mode).toBe('shortBreak');
    expect(state.totalSeconds).toBe(5 * 60);
    expect(state.formattedTime).toBe('05:00');
  });

  it('correctly switches to sleep timer mode with custom minutes', () => {
    timer.setMode('sleep', 45);
    const state = timer.getState();
    expect(state.mode).toBe('sleep');
    expect(state.totalSeconds).toBe(45 * 60);
    expect(state.formattedTime).toBe('45:00');
  });

  it('starts, pauses, and resets cleanly', () => {
    timer.start();
    expect(timer.getState().isRunning).toBe(true);

    timer.pause();
    expect(timer.getState().isRunning).toBe(false);

    timer.setTime(120);
    expect(timer.getState().formattedTime).toBe('02:00');

    timer.reset();
    expect(timer.getState().formattedTime).toBe('02:00');
  });
});
