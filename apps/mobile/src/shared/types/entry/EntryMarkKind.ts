/**
 * O tipo de marca de um lançamento: a conta avulsa, o pagamento, a conta paga só pelas contribuições
 * (`paidByContributions`) e a contribuição.
 */
export type IEntryMarkKind = 'oneOff' | 'payment' | 'paidByContributions' | 'contribution';
