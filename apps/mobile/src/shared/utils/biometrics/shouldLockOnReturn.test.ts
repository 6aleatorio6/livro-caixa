import { shouldLockOnReturn } from './shouldLockOnReturn';

const MINUTE_MS = 60 * 1000;
const backgroundedAtMs = Date.parse('2026-11-08T10:00:00Z');

describe('shouldLockOnReturn', () => {
  it('Should not lock when the app comes back 9 minutes and 59 seconds after leaving', () => {
    const returnedAtMs = backgroundedAtMs + 10 * MINUTE_MS - 1000;

    expect(shouldLockOnReturn(true, backgroundedAtMs, returnedAtMs)).toBe(false);
  });

  it('Should lock when the app comes back exactly 10 minutes after leaving', () => {
    const returnedAtMs = backgroundedAtMs + 10 * MINUTE_MS;

    expect(shouldLockOnReturn(true, backgroundedAtMs, returnedAtMs)).toBe(true);
  });

  it('Should never lock with the option off, however long the app was away', () => {
    const returnedAtMs = backgroundedAtMs + 3 * 60 * MINUTE_MS;

    expect(shouldLockOnReturn(false, backgroundedAtMs, returnedAtMs)).toBe(false);
  });

  it('Should not lock when there is no leave time', () => {
    expect(shouldLockOnReturn(true, null, backgroundedAtMs)).toBe(false);
  });
});
