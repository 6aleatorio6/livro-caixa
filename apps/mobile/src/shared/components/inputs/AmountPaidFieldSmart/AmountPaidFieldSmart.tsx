import type { FieldPath, UseFormReturn } from 'react-hook-form';

import { useAmountFromReceipt } from '@/shared/hooks/useAmountFromReceipt/useAmountFromReceipt';
import type { IAmountAndReceiptValues } from '@/shared/types/form/AmountAndReceiptValues';

import { MoneyFieldSmart } from '@/shared/components/inputs/MoneyFieldSmart/MoneyFieldSmart';

export interface IAmountPaidFieldSmartProps<TValues extends IAmountAndReceiptValues, TContext> {
  form: UseFormReturn<TValues, TContext>;
  /** O rótulo do campo; a contribuição troca o "Valor pago" por "Quanto você pagou". */
  label?: string;
  /** O texto de apoio enquanto o valor mostrado não é o lido no comprovante. */
  supportText?: string;
  /** O aviso enquanto o valor mostrado é o lido no comprovante; sem ele, o do pagamento. */
  receiptNote?: string;
}

/**
 * O "Valor pago" dos formulários com comprovante: o valor lido no comprovante anexado preenche o campo, com o aviso no
 * texto de apoio. Fica num componente à parte para que só ele, e não o formulário inteiro, renderize a cada dígito.
 */
export function AmountPaidFieldSmart<TValues extends IAmountAndReceiptValues, TContext>({
  form,
  label = 'Valor pago',
  supportText,
  receiptNote,
}: IAmountPaidFieldSmartProps<TValues, TContext>) {
  const receiptAmountNote = useAmountFromReceipt(form, receiptNote);
  return (
    <MoneyFieldSmart
      control={form.control}
      name={'amountCents' as FieldPath<TValues>}
      label={label}
      supportText={receiptAmountNote ?? supportText}
    />
  );
}
