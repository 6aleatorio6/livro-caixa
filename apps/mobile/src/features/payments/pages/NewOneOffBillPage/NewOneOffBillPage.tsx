import { router } from 'expo-router';

import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';
import { displayNameOf } from '@/shared/utils/person/displayNameOf';

import { OneOffBillForm } from '@/features/payments/components/OneOffBillForm/OneOffBillForm';
import { doAddOneOffBill } from '@/features/payments/utils/actions/doAddOneOffBill';

/** Onde qualquer membro registra uma conta avulsa já paga: nome, valor, data, tag e comprovante. */
export function NewOneOffBillPage() {
  const email = signedInEmail(useAuthState());
  const { data: person } = useRealtime(allowedEmailQueryService, { email });
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});

  return (
    <Screen>
      <TopBar title="Nova conta avulsa" />
      <ScreenContent>
        <OneOffBillForm
          tags={tags ?? []}
          hasTagsError={tagsStatus === 'error'}
          personName={email ? displayNameOf({ name: person?.name ?? null, email }) : null}
          onSubmit={async (input) => {
            const { error } = await doAddOneOffBill(input);
            if (!error) router.back();
          }}
        />
      </ScreenContent>
    </Screen>
  );
}
