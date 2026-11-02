/**
 * O maior valor em centavos, R$ 9.999.999,99: o que passa disso é erro de digitação ou de leitura. As regras do
 * Firestore (`isValidAmountCents`) têm o mesmo teto.
 */
export const MAX_AMOUNT_CENTS = 999_999_999;
