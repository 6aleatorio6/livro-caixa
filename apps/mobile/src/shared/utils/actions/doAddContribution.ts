import { addContributionService } from '@/shared/services/entry/add/addContributionService';
import type { IContributionInput } from '@/shared/types/entry/ContributionInput';
import { createAsyncAction } from '@/shared/utils/handlerError/createAsyncAction';
import { notifyFamilyOfEntry } from '@/shared/utils/notifications/notifyFamilyOfEntry';

// Fica em `shared` porque o pagamento do Início e o Contribuir dos detalhes a chamam.
export const doAddContribution = createAsyncAction({
  run: async (contribution: IContributionInput) => {
    await addContributionService(contribution);
    const { target, amountCents } = contribution;
    // Sem esperar: o loader e o aviso de sucesso não dependem da rede da notificação.
    void notifyFamilyOfEntry(
      'entry' in target
        ? {
            kind: 'contribution',
            targetId: target.entry.id,
            month: target.entry.kind === 'overduePayment' ? target.entry.billMonth : target.entry.month,
            name: target.entry.name,
            amountCents,
          }
        : {
            kind: 'contribution',
            targetId: `${target.month}_${target.bill.id}`,
            month: target.month,
            name: target.bill.name,
            amountCents,
          },
    );
  },
  shouldShowLoader: true,
  successMessage: 'Contribuição registrada.',
});
