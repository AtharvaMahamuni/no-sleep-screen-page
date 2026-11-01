import { describe, it, expect, beforeEach } from 'vitest';
import { WakeLockManager } from '../../src/engines/session/WakeLockManager';

describe('WakeLockManager', () => {
  let manager: WakeLockManager;

  beforeEach(() => {
    manager = new WakeLockManager();
  });

  it('starts in idle status by default', () => {
    expect(manager.getStatus()).toBe('idle');
  });

  it('correctly handles unsupported environments gracefully', async () => {
    const success = await manager.acquire();
    expect(success).toBe(false);
    expect(manager.getStatus()).toBe('unsupported');
  });

  it('triggers listener callbacks on status update', () => {
    let captured = '';
    const unsubscribe = manager.onStatusChange(status => {
      captured = status;
    });

    expect(captured).toBe('idle');
    unsubscribe();
  });
});
