import { isVersionBelow } from './isVersionBelow';

describe('isVersionBelow', () => {
  it('Should put 0.9.0 below 0.10.0', () => {
    expect(isVersionBelow('0.9.0', '0.10.0')).toBe(true);
  });

  it('Should not put 0.10.0 below 0.9.0', () => {
    expect(isVersionBelow('0.10.0', '0.9.0')).toBe(false);
  });

  it('Should not put a version below itself', () => {
    expect(isVersionBelow('0.5.0', '0.5.0')).toBe(false);
  });

  it('Should put 0.3.0 below 0.4.0', () => {
    expect(isVersionBelow('0.3.0', '0.4.0')).toBe(true);
  });

  it('Should not put 1.0.0 below 0.99.99', () => {
    expect(isVersionBelow('1.0.0', '0.99.99')).toBe(false);
  });

  it('Should never block on a malformed minimum', () => {
    expect(isVersionBelow('0.3.0', '')).toBe(false);
    expect(isVersionBelow('0.3.0', 'abc')).toBe(false);
    expect(isVersionBelow('0.3.0', '1.2')).toBe(false);
    expect(isVersionBelow('0.3.0', '1.2.x')).toBe(false);
  });
});
