import { pluralize } from './pluralize';

describe('pluralize', () => {
  it.each([
    { count: 0, expected: '0 contas' },
    { count: 1, expected: '1 conta' },
    { count: 2, expected: '2 contas' },
  ])('Should write $count as "$expected"', ({ count, expected }) => {
    expect(pluralize(count, 'conta', 'contas')).toBe(expected);
  });
});
