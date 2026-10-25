import { router } from 'expo-router';

import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';

import { RecurringBillForm } from '@/features/recurringBills/components/RecurringBillForm/RecurringBillForm';
import { doAddRecurringBill } from '@/features/recurringBills/utils/actions/doAddRecurringBill';

/** Onde qualquer membro cadastra uma conta recorrente: o nome, o valor previsto, o dia, a data de início e a tag. */
export function NewRecurringBillPage() {
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});

  return (
    <Screen>
      <TopBar title="Nova conta recorrente" />
      <ScreenContent>
        <RecurringBillForm
          tags={tags ?? []}
          hasTagsError={tagsStatus === 'error'}
          submitLabel="Cadastrar conta"
          onSubmit={async (input) => {
            const { error } = await doAddRecurringBill(input);
            if (!error) router.back();
          }}
        />
      </ScreenContent>
    </Screen>
  );
}
