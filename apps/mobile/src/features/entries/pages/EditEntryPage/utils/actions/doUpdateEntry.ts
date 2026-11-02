import { updateEntryService } from '@/shared/services/entry/updateEntryService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

const SUCCESS_MESSAGE_BY_KIND = {
  recurringPayment: 'Pagamento alterado.',
  oneOffBill: 'Conta avulsa alterada.',
  contribution: 'Contribuição alterada.',
} as const;

export const doUpdateEntry = createAsyncAction({
  run: updateEntryService,
  shouldShowLoader: true,
  successMessage: ({ entry }) => SUCCESS_MESSAGE_BY_KIND[entry.kind],
});
