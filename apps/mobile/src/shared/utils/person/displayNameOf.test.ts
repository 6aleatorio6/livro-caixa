import { displayNameOf } from './displayNameOf';

describe('displayNameOf', () => {
  it('Should use the name when the person has one', () => {
    expect(displayNameOf({ name: 'Bruno Souza', email: 'bruno.souza@exemplo.com' })).toBe('Bruno Souza');
  });

  it('Should use the e-mail when the person has not entered yet', () => {
    expect(displayNameOf({ name: null, email: 'elisa.souza@exemplo.com' })).toBe('elisa.souza@exemplo.com');
  });
});
