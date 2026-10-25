import { isPermissionDenied } from './isPermissionDenied';

describe('isPermissionDenied', () => {
  it.each(['firestore/permission-denied', 'permission-denied'])('Should recognize the code %s', (code) => {
    expect(isPermissionDenied({ code })).toBe(true);
  });

  it.each([{ code: 'firestore/unavailable' }, new Error('x'), null, undefined])(
    'Should not recognize %p',
    (error) => {
      expect(isPermissionDenied(error)).toBe(false);
    },
  );
});
