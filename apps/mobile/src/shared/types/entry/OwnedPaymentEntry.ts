import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';

/** O pagamento de uma conta recorrente que tem dono: o do mês dela ou o de uma conta atrasada (a avulsa fica de fora). */
export type IOwnedPaymentEntry = Extract<IOwnedEntry, { kind: 'recurringPayment' | 'overduePayment' }>;
