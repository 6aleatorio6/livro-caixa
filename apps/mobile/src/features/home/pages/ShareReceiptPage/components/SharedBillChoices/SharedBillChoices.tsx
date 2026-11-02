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
import { shiftMonth } from '@/shared/utils/date/shiftMonth';

import { SharedMonthBills } from '../SharedMonthBills/SharedMonthBills';
import { SharedPaidByOthers } from '../SharedPaidByOthers/SharedPaidByOthers';

/**
 * O que escolher para o comprovante compartilhado: "Conta avulsa" primeiro, depois as contas a pagar do mês atual e
 * as do próximo, que já pode ser pago, e por fim as contas dos dois meses já pagas por outros membros, que recebem
 * contribuições. Cada mês, as tags e as pessoas são lidos uma vez aqui e servem às duas listas. Só é montado com o
 * arquivo pronto: as leituras do mês não abrem enquanto ele é lido nem quando é recusado.
 */
export function SharedBillChoices() {
  // Os dois meses ficam os da abertura da tela, mesmo que a meia-noite do último dia passe com ela aberta.
  const [month] = useState(currentMonth);
  const nextMonth = shiftMonth(month, 1);
  const thisMonthSummary = useMonthSummary(month);
  const nextMonthSummary = useMonthSummary(nextMonth);
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
      <SharedMonthBills month={month} {...thisMonthSummary} tags={tags} people={people} />
      <SharedMonthBills month={nextMonth} {...nextMonthSummary} tags={tags} people={people} />
      <SharedPaidByOthers month={month} summary={thisMonthSummary.summary} tags={tags} people={people} uid={uid} />
      <SharedPaidByOthers month={nextMonth} summary={nextMonthSummary.summary} tags={tags} people={people} uid={uid} />
    </>
  );
}
