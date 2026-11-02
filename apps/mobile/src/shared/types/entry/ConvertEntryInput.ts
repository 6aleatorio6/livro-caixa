import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import type { IReceipt } from '@/shared/types/file/Receipt';

/**
 * O que a tela envia ao transformar um lançamento pelo interruptor Paguei só uma parte de Alterar: o pagamento que
 * vira contribuição, ou a contribuição que vira o pagamento do mês, com o valor do formulário e o comprovante novo,
 * ou `null` para manter o que já tem.
 */
export interface IConvertEntryInput {
  entry: Extract<IOwnedEntry, { kind: 'recurringPayment' }> | IContributionEntry;
  amountCents: number;
  receipt: IReceipt | null;
}
