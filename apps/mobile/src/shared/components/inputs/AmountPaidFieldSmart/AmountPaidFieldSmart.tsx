import type { FieldPath, UseFormReturn } from 'react-hook-form';

import { useAmountFromReceipt } from '@/shared/hooks/useAmountFromReceipt/useAmountFromReceipt';
import type { IAmountAndReceiptValues } from '@/shared/types/form/AmountAndReceiptValues';

import { MoneyFieldSmart } from '@/shared/components/inputs/MoneyFieldSmart/MoneyFieldSmart';

export interface IAmountPaidFieldSmartProps<TValues extends IAmountAndReceiptValues, TContext> {
  form: UseFormReturn<TValues, TContext>;
  /** O texto de apoio enquanto o valor mostrado não é o lido no comprovante. */
  supportText?: string;
}

/**
 * O "Valor pago" dos formulários com comprovante: o valor lido no comprovante anexado preenche o campo, com o aviso no
 * texto de apoio. Fica num componente à parte para que só ele, e não o formulário inteiro, renderize a cada dígito.
 */
export function AmountPaidFieldSmart<TValues extends IAmountAndReceiptValues, TContext>({
  form,
  supportText,
}: IAmountPaidFieldSmartProps<TValues, TContext>) {
  const receiptAmountNote = useAmountFromReceipt(form);
  return (
    <MoneyFieldSmart
      control={form.control}
      name={'amountCents' as FieldPath<TValues>}
      label="Valor pago"
      supportText={receiptAmountNote ?? supportText}
    />
  );
}
