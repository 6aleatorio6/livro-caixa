import { router } from 'expo-router';

import { OneOffBillForm } from '@/shared/components/OneOffBillForm/OneOffBillForm';
import { OwnershipNotice } from '@/shared/components/OwnershipNotice/OwnershipNotice';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';

import { doAddOneOffBill } from '@/features/payments/utils/actions/doAddOneOffBill';

/** Onde qualquer membro registra uma conta avulsa já paga: nome, valor, data, tag e comprovante. */
export function NewOneOffBillPage() {
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});

  return (
    <Screen>
      <TopBar title="Nova conta avulsa" />
      <ScreenContent>
        <OneOffBillForm
          tags={tags ?? []}
          hasTagsError={tagsStatus === 'error'}
          notice={<OwnershipNotice subject="esta conta" />}
          onSubmit={async (input) => {
            const { error } = await doAddOneOffBill(input);
            if (!error) router.back();
          }}
        />
      </ScreenContent>
    </Screen>
  );
}
