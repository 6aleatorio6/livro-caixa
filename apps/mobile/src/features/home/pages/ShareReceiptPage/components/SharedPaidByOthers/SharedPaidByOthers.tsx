import { router } from 'expo-router';
import { Check } from 'lucide-react-native';

import { MonthListSection } from '@/features/home/components/MonthListSection/MonthListSection';
import type { IMonthSummary } from '@/features/home/types/MonthSummary';
import { paidRowsOf } from '@/features/home/utils/paidRowsOf';
import { Button } from '@/shared/components/Button/Button';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IOwnedEntry } from '@/shared/types/entry/OwnedEntry';
import type { ITag } from '@/shared/types/tag/Tag';
import { monthName } from '@/shared/utils/date/monthName';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { isOwnedEntry } from '@/shared/utils/entry/isOwnedEntry';
import { formatCents } from '@/shared/utils/format/formatCents';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { findTag } from '@/shared/utils/tag/findTag';

export interface ISharedPaidByOthersProps {
  /** O mês da lista, 'AAAA-MM'. */
  month: string;
  /** O resumo do mês; `null` enquanto as leituras não chegam. */
  summary: IMonthSummary | null;
  tags: ITag[] | null;
  people: IAllowedEmailListItem[] | null;
  /** Quem compartilha: as contas que ele mesmo pagou ficam de fora. */
  uid: string | null;
}

/**
 * As contas do mês que outros membros já pagaram e ainda têm o que receber, para o comprovante compartilhado ser uma
 * contribuição: o toque segue na contribuição, com o comprovante. Ficam de fora as de quem compartilha e as que já
 * receberam tudo; sem nenhuma, a lista não aparece.
 */
export function SharedPaidByOthers({ month, summary, tags, people, uid }: ISharedPaidByOthersProps) {
  const entries = summary?.entries ?? [];
  // Na ordem das contas pagas do Início: pelo dia, e no mesmo dia pelo nome.
  const bills = paidRowsOf(summary?.paid ?? []).filter(
    (entry): entry is IOwnedEntry => isOwnedEntry(entry) && entry.paidBy !== uid && !isFullyContributed(entry, entries),
  );
  if (bills.length === 0) return null;

  return (
    <MonthListSection title={`Já pagas por outros em ${monthName(month)}`}>
      {bills.map((entry) => {
        const contribute = () =>
          router.push({ pathname: '/entries/[id]/contribute', params: { id: entry.id, shared: '1' } });
        return (
          <ListItem
            key={entry.id}
            icon={Check}
            title={entry.name}
            support={`${formatCents(entry.amountCents)} · pago por ${memberNameOf(entry.paidBy, people ?? [])}`}
            tag={findTag(entry.tagId, tags)}
            isCompact
            markColor="primaryContainer"
            iconColor="onPrimaryContainer"
            trailing={
              <Button
                label="Contribuir"
                accessibilityLabel={`Contribuir em ${entry.name}`}
                variant="tertiary"
                isCompact
                onPress={contribute}
              />
            }
            onPress={contribute}
          />
        );
      })}
    </MonthListSection>
  );
}
