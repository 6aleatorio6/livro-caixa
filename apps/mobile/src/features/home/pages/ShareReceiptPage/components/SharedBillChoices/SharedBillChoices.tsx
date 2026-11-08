import { router } from 'expo-router';
import { Receipt } from 'lucide-react-native';
import { useState } from 'react';

import { useMonthSummary } from '@/features/home/hooks/useMonthSummary/useMonthSummary';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { signedInUid } from '@/shared/utils/auth/signedInUid';
import { currentMonth } from '@/shared/utils/date/currentMonth';

import { ShareMonthFilter } from '../ShareMonthFilter/ShareMonthFilter';
import { SharedMonthBills } from '../SharedMonthBills/SharedMonthBills';
import { SharedPaidByOthers } from '../SharedPaidByOthers/SharedPaidByOthers';

/**
 * O que escolher para o comprovante compartilhado. Só o mês escolhido é lido, e trocar de mês o lê de novo, com o
 * carregamento até chegar. Só é montado com o arquivo pronto: as leituras não abrem enquanto ele é lido nem quando é
 * recusado.
 */
export function SharedBillChoices() {
  // "Este mês" é o da abertura da tela, mesmo que a meia-noite do último dia passe com ela aberta.
  const [thisMonth] = useState(currentMonth);
  const [month, setMonth] = useState(thisMonth);
  const monthSummary = useMonthSummary(month);
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
      <ShareMonthFilter thisMonth={thisMonth} month={month} onMonthChange={setMonth} />
      <SharedMonthBills month={month} {...monthSummary} tags={tags} people={people} />
      <SharedPaidByOthers month={month} summary={monthSummary.summary} tags={tags} people={people} uid={uid} />
    </>
  );
}
