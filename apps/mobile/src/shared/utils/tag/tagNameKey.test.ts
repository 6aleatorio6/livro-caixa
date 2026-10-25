import { tagNameKey } from './tagNameKey';

describe('tagNameKey', () => {
  it.each([
    { name: 'Saúde', expected: 'saude' },
    { name: 'saude', expected: 'saude' },
    { name: 'SAÚDE', expected: 'saude' },
    { name: '  Saúde  ', expected: 'saude' },
    { name: 'Ação', expected: 'acao' },
    { name: 'Serviços', expected: 'servicos' },
  ])('Should give "$expected" for "$name"', ({ name, expected }) => {
    expect(tagNameKey(name)).toBe(expected);
  });
});
