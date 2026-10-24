import { allowedEmailId } from './allowed-email-id';

describe('allowedEmailId', () => {
  it('Should find the list entry of a Google e-mail that comes with capital letters', () => {
    expect(allowedEmailId(' Ana.Souza@Gmail.com ')).toBe('ana.souza@gmail.com');
  });
});
