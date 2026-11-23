import { router } from 'expo-router';
import { Receipt } from 'lucide-react-native';
import { useState } from 'react';

import { useMonthSummary } from '@/features/home/hooks/useMonthSummary/useMonthSummary';
import type { IShareChoice } from '@/features/home/types/ShareChoice';
import { isOverdueFromEarlierMonth } from '@/features/home/utils/isOverdueFromEarlierMonth';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { signedInUid } from '@/shared/utils/auth/signedInUid';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { shiftMonth } from '@/shared/utils/date/shiftMonth';

import { ShareMonthFilter } from '../ShareMonthFilter/ShareMonthFilter';
import { SharedMonthBills } from '../SharedMonthBills/SharedMonthBills';
import { SharedPaidByOthers } from '../SharedPaidByOthers/SharedPaidByOthers';

/**
 * O que escolher para o comprovante compartilhado. Lê o mês atual, que diz se há conta atrasada (a pílula "Atrasadas"
 * não some ao olhar o mês que vem) e é a lista de "Atrasadas" e de "Este mês"; o mês que vem só é lido enquanto a
 * pílula dele está escolhida, com o carregamento até chegar.
 * Só é montado com o arquivo pronto: as leituras não abrem enquanto ele é lido nem quando é recusado.
 */
export function SharedBillChoices() {
  // "Este mês" é o da abertura da tela, mesmo que a meia-noite do último dia passe com ela aberta.
  const [thisMonth] = useState(currentMonth);
  const nextMonth = shiftMonth(thisMonth, 1);
  const [choice, setChoice] = useState<IShareChoice>('thisMonth');
  const thisMonthReads = useMonthSummary({ month: thisMonth, currentMonth: thisMonth });
  const nextMonthReads = useMonthSummary({ month: choice === 'nextMonth' ? nextMonth : null, currentMonth: thisMonth });
  const hasOverdue = Boolean(thisMonthReads.summary?.toPay.some(isOverdueFromEarlierMonth));
  // A última atrasada paga por outro membro com a pílula escolhida a tira: a lista volta para "Este mês".
  const shownChoice = choice === 'overdue' && !hasOverdue ? 'thisMonth' : choice;
  const month = shownChoice === 'nextMonth' ? nextMonth : thisMonth;
  const { summary, hasError } = shownChoice === 'nextMonth' ? nextMonthReads : thisMonthReads;
  const { data: tags } = useRealtime(tagListQueryService, {});
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  const uid = signedInUid(useAuthState());

  return (
    <>
      <ListItem
        icon={Receipt}
        title="Conta avulsa"
        support="Uma conta que não se repete"
        onPress={() => router.push({ pathname: '/one-off-bills/new', params: { shared: '1' } })}
      />
      <ShareMonthFilter hasOverdue={hasOverdue} choice={shownChoice} onChoiceChange={setChoice} />
      <SharedMonthBills
        month={month}
        isOverdueList={shownChoice === 'overdue'}
        summary={summary}
        hasError={hasError}
        tags={tags}
        people={people}
      />
      {shownChoice === 'overdue' ? null : (
        <SharedPaidByOthers month={month} summary={summary} tags={tags} people={people} uid={uid} />
      )}
    </>
  );
}
