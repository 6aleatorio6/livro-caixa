import { router } from 'expo-router';
import { Receipt } from 'lucide-react-native';
import { useState } from 'react';

import { ListItem } from '@/shared/components/ListItem/ListItem';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { shiftMonth } from '@/shared/utils/date/shiftMonth';

import { SharedMonthBills } from '../SharedMonthBills/SharedMonthBills';
import { SharedPaidByOthers } from '../SharedPaidByOthers/SharedPaidByOthers';

/**
 * O que escolher para o comprovante compartilhado: "Conta avulsa" primeiro, depois as contas a pagar do mês atual e
 * as do próximo, que já pode ser pago, e por fim as contas dos dois meses já pagas por outros membros, que recebem
 * contribuições. Só é montado com o arquivo pronto: as leituras do mês não abrem enquanto ele é
 * lido nem quando é recusado.
 */
export function SharedBillChoices() {
  // Os dois meses ficam os da abertura da tela, mesmo que a meia-noite do último dia passe com ela aberta.
  const [month] = useState(currentMonth);

  return (
    <>
      <ListItem
        icon={Receipt}
        title="Conta avulsa"
        support="Uma conta que não se repete"
        onPress={() => router.push({ pathname: '/one-off-bills/new', params: { shared: '1' } })}
      />
      <SharedMonthBills month={month} />
      <SharedMonthBills month={shiftMonth(month, 1)} />
      <SharedPaidByOthers month={month} />
      <SharedPaidByOthers month={shiftMonth(month, 1)} />
    </>
  );
}
