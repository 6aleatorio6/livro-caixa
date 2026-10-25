import { initialNameOf } from './initialNameOf';

describe('initialNameOf', () => {
  it('Should use the name of the Google account without the spaces at the ends', () => {
    expect(initialNameOf({ displayName: ' Carla Lima ', email: 'carla.lima@exemplo.com' })).toBe('Carla Lima');
  });

  it.each([
    { case: 'a name with only spaces', displayName: '   ' },
    { case: 'no name', displayName: null },
  ])('Should use the start of the e-mail for $case', ({ displayName }) => {
    expect(initialNameOf({ displayName, email: 'carla.lima@exemplo.com' })).toBe('carla.lima');
  });

  it('Should cut a name above 60 characters, the limit of the rules', () => {
    const name = initialNameOf({ displayName: 'a'.repeat(61), email: 'carla.lima@exemplo.com' });

    expect(name).toBe('a'.repeat(60));
  });

  it('Should cut the start of a long e-mail when the account has no name', () => {
    const name = initialNameOf({ displayName: null, email: `${'b'.repeat(70)}@exemplo.com` });

    expect(name).toBe('b'.repeat(60));
  });

  it('Should not leave a space at the end of the cut name', () => {
    const name = initialNameOf({ displayName: `${'a'.repeat(59)} bcd`, email: 'carla.lima@exemplo.com' });

    expect(name).toBe('a'.repeat(59));
  });
});
