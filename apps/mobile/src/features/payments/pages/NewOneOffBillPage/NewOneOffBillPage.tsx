import { OneOffBillForm } from '@/shared/components/OneOffBillForm/OneOffBillForm';
import { OwnershipNotice } from '@/shared/components/OwnershipNotice/OwnershipNotice';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useSharedReceiptOpening } from '@/shared/hooks/useSharedReceiptOpening/useSharedReceiptOpening';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';

import { doAddOneOffBill } from '@/features/payments/utils/actions/doAddOneOffBill';

/** Onde qualquer membro registra uma conta avulsa já paga: nome, valor, data, tag e comprovante. */
export function NewOneOffBillPage() {
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});
  const { initialReceipt, finish } = useSharedReceiptOpening();

  return (
    <Screen>
      <TopBar title="Nova conta avulsa" />
      <ScreenContent>
        <OneOffBillForm
          tags={tags ?? []}
          hasTagsError={tagsStatus === 'error'}
          initialValues={{ receipt: initialReceipt }}
          notice={<OwnershipNotice subject="esta conta" />}
          onSubmit={async (input) => {
            const { error } = await doAddOneOffBill(input);
            if (error) return;
            finish();
          }}
        />
      </ScreenContent>
    </Screen>
  );
}
