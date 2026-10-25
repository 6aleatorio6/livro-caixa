import { router } from 'expo-router';
import { Receipt } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { BillToPayItem } from '@/features/home/components/BillToPayItem/BillToPayItem';
import { MonthListSection } from '@/features/home/components/MonthListSection/MonthListSection';
import { useMonthSummary } from '@/features/home/hooks/useMonthSummary/useMonthSummary';
import { AppText } from '@/shared/components/AppText/AppText';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { dayOf } from '@/shared/utils/date/dayOf';
import { monthName } from '@/shared/utils/date/monthName';
import { tagNameOf } from '@/shared/utils/tag/tagNameOf';

/**
 * As contas a pagar do mês atual, com "Conta avulsa" por último. Só é montado com o arquivo pronto: as três leituras
 * do mês não abrem enquanto ele é lido nem quando é recusado.
 */
export function SharedBillChoices() {
  const { theme } = useUnistyles();
  const [month] = useState(currentMonth);
  const { summary, hasError } = useMonthSummary(month);
  const { data: tags } = useRealtime(tagListQueryService, {});

  return (
    <MonthListSection title={`A pagar em ${monthName(month)}`}>
      {hasError ? (
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          Não deu para carregar o mês.
        </AppText>
      ) : null}
      {!summary && !hasError ? (
        <ActivityIndicator
          accessibilityLabel="Carregando as contas"
          style={styles.loader}
          color={theme.colors.primary}
        />
      ) : null}
      {summary?.toPay.map(({ bill, dueDate }) => (
        <BillToPayItem
          key={bill.id}
          name={bill.name}
          expectedCents={bill.expectedAmountCents}
          dueDay={dayOf(dueDate)}
          tagName={tagNameOf(bill.tagId, tags)}
          onPress={() =>
            router.push({ pathname: '/recurring-bills/[id]/pay', params: { id: bill.id, month, shared: '1' } })
          }
        />
      ))}
      {summary?.toPay.length === 0 ? (
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          Nenhuma conta a pagar em {monthName(month)}.
        </AppText>
      ) : null}
      <ListItem
        icon={Receipt}
        title="Conta avulsa"
        support="Uma conta que não se repete"
        onPress={() => router.push({ pathname: '/one-off-bills/new', params: { shared: '1' } })}
      />
    </MonthListSection>
  );
}

const styles = StyleSheet.create({
  loader: { alignSelf: 'center' },
});
