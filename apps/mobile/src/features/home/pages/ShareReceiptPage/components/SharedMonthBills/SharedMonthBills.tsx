import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { BillToPayItem } from '@/features/home/components/BillToPayItem/BillToPayItem';
import { MonthListSection } from '@/features/home/components/MonthListSection/MonthListSection';
import type { IMonthSummary } from '@/features/home/types/MonthSummary';
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
  /** O resumo do mês; `null` enquanto as leituras não chegam. */
  summary: IMonthSummary | null;
  /** Uma das leituras do mês falhou. */
  hasError: boolean;
  tags: ITag[] | null;
  people: IAllowedEmailListItem[] | null;
}

/** As contas a pagar de um mês, para escolher a que o comprovante paga: o toque segue no pagamento daquele mês. */
export function SharedMonthBills({ month, summary, hasError, tags, people }: ISharedMonthBillsProps) {
  const { theme } = useUnistyles();

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
      {summary?.toPay.map(({ bill, name, tagId, dueDate, contributions, remainingCents }) => (
        <BillToPayItem
          key={bill.id}
          name={name}
          remainingCents={remainingCents}
          dueDay={dayOf(dueDate)}
          contributionsSupport={contributionsSupportOf(contributions, people ?? [])}
          tag={findTag(tagId, tags)}
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
