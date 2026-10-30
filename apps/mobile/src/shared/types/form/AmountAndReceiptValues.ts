import type { FieldValues } from 'react-hook-form';

import type { IReceipt } from '@/shared/types/file/Receipt';

/** Os valores de um formulário com o valor pago e o comprovante, os dois campos que o valor lido no comprovante liga. */
export type IAmountAndReceiptValues = FieldValues & { amountCents: number | null; receipt: IReceipt | null };
