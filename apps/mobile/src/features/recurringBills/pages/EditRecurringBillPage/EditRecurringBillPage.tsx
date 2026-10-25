import { router, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';

import { RecurringBillForm } from '@/features/recurringBills/components/RecurringBillForm/RecurringBillForm';
import { doUpdateRecurringBill } from '@/features/recurringBills/utils/actions/doUpdateRecurringBill';

import { DeleteRecurringBillSection } from './components/DeleteRecurringBillSection/DeleteRecurringBillSection';

/** Onde qualquer membro altera uma conta recorrente ou a exclui. */
export function EditRecurringBillPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, data: bills } = useRealtime(recurringBillListQueryService, {});
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});
  const bill = bills?.find((candidate) => candidate.id === id);
  // A tag da conta só se confere com as tags lidas: o formulário não nasce antes delas.
  const hasReadTags = tagsStatus === 'success' || tagsStatus === 'cached' || tagsStatus === 'error';

  return (
    <Screen>
      <TopBar title="Alterar conta recorrente" />
      <ScreenContent>
        {/* O formulário começa com a conta atual: só nasce com a conta e as tags lidas. */}
        {bill && hasReadTags ? (
          <RecurringBillForm
            tags={tags ?? []}
            hasTagsError={tagsStatus === 'error'}
            bill={bill}
            submitLabel="Salvar alterações"
            onSubmit={async (input) => {
              const { error } = await doUpdateRecurringBill({ id: bill.id, ...input });
              if (!error) router.back();
            }}
          >
            <DeleteRecurringBillSection bill={bill} onDeleted={() => router.back()} />
          </RecurringBillForm>
        ) : null}
        {/* Só o servidor diz que a conta não existe mais: a lista do aparelho pode estar atrasada. */}
        {status === 'success' && !bill ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Esta conta foi excluída.
          </AppText>
        ) : null}
        {status === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a conta.
          </AppText>
        ) : null}
      </ScreenContent>
    </Screen>
  );
}
