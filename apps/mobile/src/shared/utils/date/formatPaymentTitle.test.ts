import { formatPaymentTitle } from './formatPaymentTitle';

describe('formatPaymentTitle', () => {
  it.each([
    ['2026-10', 'Pagamento de outubro de 2026'],
    ['2025-03', 'Pagamento de março de 2025'],
  ])('Should write %s as %s', (month, expected) => {
    expect(formatPaymentTitle(month)).toBe(expected);
  });
});
