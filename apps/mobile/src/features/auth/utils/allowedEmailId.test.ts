import { allowedEmailId } from './allowedEmailId';

describe('allowedEmailId', () => {
  it('Should find the list entry of a Google e-mail that comes with capital letters', () => {
    expect(allowedEmailId(' Ana.Souza@Gmail.com ')).toBe('ana.souza@gmail.com');
  });
});
