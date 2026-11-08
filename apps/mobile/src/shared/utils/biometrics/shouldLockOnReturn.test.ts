import { shouldLockOnReturn } from './shouldLockOnReturn';

const MINUTE_MS = 60 * 1000;
const backgroundedAt = Date.parse('2026-11-08T10:00:00Z');

describe('shouldLockOnReturn', () => {
  it('Should not lock when the app comes back 9 minutes and 59 seconds after leaving', () => {
    const returnedAt = backgroundedAt + 10 * MINUTE_MS - 1000;

    expect(shouldLockOnReturn(true, backgroundedAt, returnedAt)).toBe(false);
  });

  it('Should lock when the app comes back exactly 10 minutes after leaving', () => {
    const returnedAt = backgroundedAt + 10 * MINUTE_MS;

    expect(shouldLockOnReturn(true, backgroundedAt, returnedAt)).toBe(true);
  });

  it('Should never lock with the option off, however long the app was away', () => {
    const returnedAt = backgroundedAt + 3 * 60 * MINUTE_MS;

    expect(shouldLockOnReturn(false, backgroundedAt, returnedAt)).toBe(false);
  });

  it('Should not lock when there is no leave time', () => {
    expect(shouldLockOnReturn(true, null, backgroundedAt)).toBe(false);
  });
});
