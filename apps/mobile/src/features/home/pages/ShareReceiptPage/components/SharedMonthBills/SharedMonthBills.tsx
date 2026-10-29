import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { BillToPayItem } from '@/features/home/components/BillToPayItem/BillToPayItem';
import { MonthListSection } from '@/features/home/components/MonthListSection/MonthListSection';
import { useMonthSummary } from '@/features/home/hooks/useMonthSummary/useMonthSummary';
import { AppText } from '@/shared/components/AppText/AppText';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { dayOf } from '@/shared/utils/date/dayOf';
import { monthName } from '@/shared/utils/date/monthName';
import { tagNameOf } from '@/shared/utils/tag/tagNameOf';

export interface ISharedMonthBillsProps {
  /** O mês da lista, 'AAAA-MM'. */
  month: string;
}

/** As contas a pagar de um mês, para escolher a que o comprovante paga: o toque segue no pagamento daquele mês. */
export function SharedMonthBills({ month }: ISharedMonthBillsProps) {
  const { theme } = useUnistyles();
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
    </MonthListSection>
  );
}

const styles = StyleSheet.create({
  loader: { alignSelf: 'center' },
});
