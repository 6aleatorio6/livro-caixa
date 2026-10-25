import { firstNameOf } from './firstNameOf';

describe('firstNameOf', () => {
  it('Should keep only the first word of a name with two words', () => {
    expect(firstNameOf('Ana Souza')).toBe('Ana');
  });

  it('Should keep only the first word of a name with more than two words', () => {
    expect(firstNameOf('Ana Paula Souza')).toBe('Ana');
  });

  it('Should keep a name with one word', () => {
    expect(firstNameOf('Bruno')).toBe('Bruno');
  });

  it('Should ignore the spaces around the name', () => {
    expect(firstNameOf('  Ana   Souza ')).toBe('Ana');
  });

  it('Should keep an e-mail whole, since the person has not entered yet', () => {
    expect(firstNameOf('elisa.souza@exemplo.com')).toBe('elisa.souza@exemplo.com');
  });
});
