import { useEffect, useRef, useState } from 'react';
import { type Path, type PathValue, type UseFormReturn, useWatch } from 'react-hook-form';

import type { IReceipt } from '@/shared/types/file/Receipt';
import type { IAmountAndReceiptValues } from '@/shared/types/form/AmountAndReceiptValues';

const RECEIPT_AMOUNT_NOTE = 'Veio do comprovante. Corrija se pagou outro valor.';

/**
 * Põe no valor pago o valor que o OCR leu no comprovante anexado, enquanto o membro não digitou no campo. Quando o
 * comprovante sai, ou chega um sem valor lido, o campo volta ao valor com que o formulário abriu (o previsto, o salvo
 * ou o vazio). Roda também ao abrir, o que cobre o comprovante compartilhado. Devolve o aviso discreto do texto de
 * apoio enquanto o valor mostrado é o lido, e `undefined` quando não é.
 */
export function useAmountFromReceipt<TValues extends IAmountAndReceiptValues, TContext>(
  form: UseFormReturn<TValues, TContext>,
): string | undefined {
  const { control, getValues, resetField, setValue } = form;
  // O RHF não deduz que `TValues` tem os dois campos: os caminhos vêm do tipo de cima.
  const amountPath = 'amountCents' as Path<TValues>;
  const receiptPath = 'receipt' as Path<TValues>;
  const receipt = useWatch({ control, name: receiptPath }) as IReceipt | null;
  const amountCents = useWatch({ control, name: amountPath }) as number | null;
  const readAmountCents = receipt?.readAmountCents ?? null;
  // O valor com que o formulário abriu, ao qual o `resetField` volta.
  const [openingAmountCents] = useState(() => getValues(amountPath) as number | null);
  // O último valor que o próprio hook deixou no campo, de início o de abertura; outro valor ali é o que o membro
  // digitou. O `isDirty` do RHF não serve: quando o comprovante volta a `null`, ele recalcula o de todos os campos pelo
  // valor inicial, e o valor lido passa a contar como digitado.
  const placedAmountCents = useRef(openingAmountCents);

  useEffect(() => {
    const shownAmountCents = getValues(amountPath) as number | null;
    // O valor que o membro digitou fica, mesmo com um comprovante novo.
    const isTypedByMember = shownAmountCents !== placedAmountCents.current;
    if (isTypedByMember) return;
    if (readAmountCents !== null) {
      setValue(amountPath, readAmountCents as PathValue<TValues, Path<TValues>>, { shouldValidate: true });
    } else if (shownAmountCents !== openingAmountCents) {
      // Só o valor lido volta ao de abertura: o `resetField` também apaga o erro do campo, e o "Preencha este campo."
      // de um envio já tentado sumiria com o campo ainda vazio.
      resetField(amountPath);
    }
    placedAmountCents.current = getValues(amountPath) as number | null;
    // O campo muda quando chega outro comprovante, não a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);

  return readAmountCents !== null && amountCents === readAmountCents ? RECEIPT_AMOUNT_NOTE : undefined;
}
