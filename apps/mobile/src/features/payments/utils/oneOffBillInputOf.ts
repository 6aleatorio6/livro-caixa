import type { IOneOffBillFormValues } from '@/features/payments/types/OneOffBillFormValues';
import type { IOneOffBillInput } from '@/shared/types/entry/OneOffBillInput';

/** O que o formulário validado entrega ao serviço (o nome já vem aparado pelo schema). */
export function oneOffBillInputOf({ name, amountCents, date, tagId, receipt }: IOneOffBillFormValues): IOneOffBillInput {
  // O schema já recusou o valor e o comprovante vazios.
  return { name, amountCents: amountCents as number, date, tagId, receipt: receipt as IOneOffBillInput['receipt'] };
}
