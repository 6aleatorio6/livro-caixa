import { deleteEntryService } from '@/shared/services/entry/deleteEntryService';
import type { IAuthoredEntry } from '@/shared/types/entry/AuthoredEntry';
import type { IEntry } from '@/shared/types/entry/Entry';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

const SUCCESS_MESSAGE_BY_KIND = {
  recurringPayment: 'Pagamento excluído.',
  oneOffBill: 'Conta avulsa excluída.',
  contribution: 'Contribuição excluída.',
} as const;

export const doDeleteEntry = createAsyncAction({
  // Só a contribuição precisa dos lançamentos do mês: a última de um pagamento sem dono o leva junto.
  run: ({ entry, monthEntries }: { entry: IAuthoredEntry; monthEntries?: IEntry[] }) =>
    entry.kind === 'contribution' ? deleteEntryService(entry, monthEntries) : deleteEntryService(entry),
  shouldShowLoader: true,
  successMessage: ({ entry }) => SUCCESS_MESSAGE_BY_KIND[entry.kind],
});
