import { convertEntryService } from '@/shared/services/entry/convertEntryService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

export const doConvertEntry = createAsyncAction({
  run: convertEntryService,
  shouldShowLoader: true,
  successMessage: ({ entry }) =>
    entry.kind === 'contribution' ? 'A contribuição virou o pagamento do mês.' : 'O pagamento virou uma contribuição.',
});
