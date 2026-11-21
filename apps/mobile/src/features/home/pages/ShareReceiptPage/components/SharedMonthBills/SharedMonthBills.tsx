import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { BillToPayItem } from '@/features/home/components/BillToPayItem/BillToPayItem';
import { MonthListSection } from '@/features/home/components/MonthListSection/MonthListSection';
import type { IMonthSummary } from '@/features/home/types/MonthSummary';
import { isOverdueFromEarlierMonth } from '@/features/home/utils/isOverdueFromEarlierMonth';
import { AppText } from '@/shared/components/AppText/AppText';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { ITag } from '@/shared/types/tag/Tag';
import { dayOf } from '@/shared/utils/date/dayOf';
import { contributionsSupportOf } from '@/shared/utils/entry/contributionsSupportOf';
import { monthName } from '@/shared/utils/date/monthName';
import { findTag } from '@/shared/utils/tag/findTag';

export interface ISharedMonthBillsProps {
  /** O mês da lista, 'AAAA-MM'. */
  month: string;
  /** Lista as contas atrasadas de meses anteriores, em vez das contas do mês. */
  isOverdueList: boolean;
  /** O resumo do mês; `null` enquanto as leituras não chegam. */
  summary: IMonthSummary | null;
  /** Uma das leituras do mês falhou. */
  hasError: boolean;
  tags: ITag[] | null;
  people: IAllowedEmailListItem[] | null;
}

/**
 * As contas a pagar de um mês, para escolher a que o comprovante paga, ou as atrasadas (de meses anteriores) do mês
 * atual, numa lista à parte: o toque segue no pagamento do mês da conta, que na atrasada é um mês anterior ao da lista.
 */
export function SharedMonthBills({ month, isOverdueList, summary, hasError, tags, people }: ISharedMonthBillsProps) {
  const { theme } = useUnistyles();
  const bills = summary?.toPay.filter((bill) => isOverdueFromEarlierMonth(bill) === isOverdueList);

  return (
    <MonthListSection title={isOverdueList ? 'Atrasadas' : `A pagar em ${monthName(month)}`}>
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
      {bills?.map(({ bill, month: billMonth, name, tagId, dueDate, contributions, remainingCents, overdue }) => (
        <BillToPayItem
          key={`${billMonth}_${bill.id}`}
          name={name}
          remainingCents={remainingCents}
          dueDay={dayOf(dueDate)}
          contributionsSupport={contributionsSupportOf(contributions, people ?? [])}
          tag={findTag(tagId, tags)}
          billMonth={billMonth}
          overdue={overdue}
          onPress={() =>
            router.push({
              pathname: '/recurring-bills/[id]/pay',
              params: { id: bill.id, month: billMonth, shared: '1' },
            })
          }
        />
      ))}
      {bills?.length === 0 ? (
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
