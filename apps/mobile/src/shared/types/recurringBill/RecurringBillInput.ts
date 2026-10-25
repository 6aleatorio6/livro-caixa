import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

/** O que a tela envia ao adicionar uma conta recorrente: sem id, e a tag pode faltar ou ser `null`. */
export type IRecurringBillInput = Omit<IRecurringBill, 'id' | 'tagId'> & { tagId?: string | null };
