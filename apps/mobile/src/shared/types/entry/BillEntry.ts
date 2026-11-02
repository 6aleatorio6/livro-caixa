import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import type { IUnownedPaymentEntry } from '@/shared/types/entry/UnownedPaymentEntry';

/** O lançamento de uma conta, o que recebe contribuições: a conta avulsa ou o pagamento, com dono ou sem. */
export type IBillEntry = IOwnedEntry | IUnownedPaymentEntry;
