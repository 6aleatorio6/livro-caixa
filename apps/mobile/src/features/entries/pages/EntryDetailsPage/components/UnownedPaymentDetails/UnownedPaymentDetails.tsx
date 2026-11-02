import { router } from 'expo-router';
import { HandCoins, Info, Paperclip } from 'lucide-react-native';
import { View } from 'react-native';

import { ContributionsSection } from '@/features/entries/components/ContributionsSection/ContributionsSection';
import { Button } from '@/shared/components/Button/Button';
import { DetailRow } from '@/shared/components/DetailRow/DetailRow';
import { Notice } from '@/shared/components/Notice/Notice';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import type { IUnownedPaymentEntry } from '@/shared/types/entry/UnownedPaymentEntry';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { formatPaymentTitle } from '@/shared/utils/date/formatPaymentTitle';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { formatCents } from '@/shared/utils/format/formatCents';
import { memberNamesOf } from '@/shared/utils/person/memberNamesOf';
import { findTag } from '@/shared/utils/tag/findTag';

import { EntryDetailsHeader } from '../EntryDetailsHeader/EntryDetailsHeader';

export interface IUnownedPaymentDetailsProps {
  entry: IUnownedPaymentEntry;
}

/**
 * A folha da conta paga só pelas contribuições, sem o comprovante da conta inteira: a conta, o mês, a soma e a lista
 * das contribuições, sem Alterar nem Excluir, porque cada uma é de quem contribuiu. O "Anexar o comprovante da conta"
 * abre o pagamento do mês, já com a soma delas, para quem tem esse comprovante ficar como quem pagou.
 */
export function UnownedPaymentDetails({ entry }: IUnownedPaymentDetailsProps) {
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  const { data: tags } = useRealtime(tagListQueryService, {});
  const { data: monthEntries } = useRealtime(entryMonthQueryService, { month: entry.month });

  const contributions = contributionsOf(entry.id, monthEntries ?? []);
  const contributedCents = sumCents(contributions);
  const isClosed = isFullyContributed(entry, monthEntries ?? []);
  const lastPaidOn = contributions
    .map(({ paidOn }) => paidOn)
    .sort()
    .at(-1);
  const tag = findTag(entry.tagId, tags);

  return (
    <>
      <EntryDetailsHeader
        markKind="paidByContributions"
        title={entry.name}
        subtitle={formatPaymentTitle(entry.month)}
        amountCents={contributedCents}
        amountSupport={`previsto ${formatCents(entry.expectedAmountCents)}`}
      />

      <View>
        <DetailRow
          label="Pago por"
          value={memberNamesOf(
            contributions.map(({ paidBy }) => paidBy),
            people ?? [],
          )}
        />
        {lastPaidOn ? <DetailRow label="Paga em" value={formatIsoDate(lastPaidOn)} /> : null}
        <DetailRow label="Vencimento" value={`dia ${entry.dueDay}`} />
        {tag ? <DetailRow label="Tag" value={tag.name} tagColor={tag.color} /> : null}
      </View>

      <ContributionsSection
        contributions={contributions}
        people={people ?? []}
        closedReason={isClosed ? 'Chegaram ao previsto, então não dá para contribuir mais.' : undefined}
      />

      <Button
        label="Contribuir"
        variant="tonal"
        icon={HandCoins}
        // Até os lançamentos do mês chegarem, não se sabe se as contribuições já alcançaram o previsto.
        disabled={!monthEntries || isClosed}
        onPress={() => router.push({ pathname: '/entries/[id]/contribute', params: { id: entry.id } })}
      />
      <Button
        label="Anexar o comprovante da conta"
        variant="tonal"
        icon={Paperclip}
        onPress={() =>
          router.push({
            pathname: '/recurring-bills/[id]/pay',
            params: { id: entry.recurringBillId, month: entry.month, attach: '1' },
          })
        }
      />
      <Notice icon={Info} text="Quem anexar o comprovante da conta fica como quem pagou." />
    </>
  );
}
