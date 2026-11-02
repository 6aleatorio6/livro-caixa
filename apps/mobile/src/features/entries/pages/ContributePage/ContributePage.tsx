import { useLocalSearchParams } from 'expo-router';

import { EntryProblem } from '@/features/entries/components/EntryProblem/EntryProblem';
import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { useSharedReceiptOpening } from '@/shared/hooks/useSharedReceiptOpening/useSharedReceiptOpening';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { entryQueryService } from '@/shared/services/entry/query/entryQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { doAddContribution } from '@/shared/utils/actions/doAddContribution';
import { signedInUid } from '@/shared/utils/auth/signedInUid';
import { billAmountOf } from '@/shared/utils/entry/billAmountOf';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { findTag } from '@/shared/utils/tag/findTag';

import { ContributionForm } from './components/ContributionForm/ContributionForm';

/**
 * A contribuição num lançamento que outro membro registrou, aberta pelo Contribuir dos detalhes ou pela conta paga por
 * outro no compartilhamento do Android. Quem registrou o lançamento não contribui nele, e o lançamento que já recebeu
 * tudo o que faltava não recebe outra.
 */
export function ContributePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { initialReceipt, finish } = useSharedReceiptOpening();
  const authState = useAuthState();
  const { status, data: entry } = useRealtime(entryQueryService, { id });
  const target = entry && entry.kind !== 'contribution' ? entry : null;
  const { data: monthEntries } = useRealtime(entryMonthQueryService, { month: target?.month ?? null });
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  const { data: tags } = useRealtime(tagListQueryService, {});

  const uid = signedInUid(authState);
  const contributedCents = target && monthEntries ? sumCents(contributionsOf(target.id, monthEntries)) : 0;
  const targetAmountCents = target && monthEntries ? billAmountOf(target, monthEntries) : 0;
  const isOwnEntry = target !== null && target.paidBy === uid;
  const isClosed =
    target !== null && monthEntries !== null && monthEntries !== undefined && isFullyContributed(target, monthEntries);

  return (
    <Screen>
      <TopBar title="Contribuir" />
      <ScreenContent>
        {isOwnEntry ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Você registrou este lançamento: quem contribui nele são os outros membros.
          </AppText>
        ) : null}
        {target && monthEntries && !isOwnEntry && isClosed ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Este lançamento já recebeu tudo o que faltava.
          </AppText>
        ) : null}
        {target && monthEntries && !isOwnEntry && !isClosed ? (
          <ContributionForm
            target={target}
            targetAmountCents={targetAmountCents}
            contributedCents={contributedCents}
            payerName={target.paidBy === null ? null : memberNameOf(target.paidBy, people ?? [])}
            tag={findTag(target.tagId, tags)}
            initialReceipt={initialReceipt}
            onSubmit={async (input) => {
              const { error } = await doAddContribution(input);
              if (!error) finish();
            }}
          />
        ) : null}
        {/* Só o servidor diz que o lançamento não existe mais: a leitura do aparelho pode estar atrasada. */}
        {status === 'success' && !target ? <EntryProblem reason="deleted" /> : null}
        {status === 'error' ? <EntryProblem reason="unreadable" /> : null}
      </ScreenContent>
    </Screen>
  );
}
