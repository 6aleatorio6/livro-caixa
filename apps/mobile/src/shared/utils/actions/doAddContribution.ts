import { addContributionService } from '@/shared/services/entry/add/addContributionService';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';

// Fica em `shared` porque o pagamento do Início e o Contribuir dos detalhes a chamam.
export const doAddContribution = createAsyncAction({
  run: addContributionService,
  shouldShowLoader: true,
  successMessage: 'Contribuição registrada.',
});
