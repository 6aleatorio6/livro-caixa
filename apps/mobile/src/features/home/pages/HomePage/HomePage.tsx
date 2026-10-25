import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { BillToPayItem } from '@/features/home/components/BillToPayItem/BillToPayItem';
import { MonthCard } from '@/features/home/components/MonthCard/MonthCard';
import { MonthListSection } from '@/features/home/components/MonthListSection/MonthListSection';
import { SplitRow } from '@/features/home/components/SplitRow/SplitRow';
import { homeEntrySupportOf } from '@/features/home/utils/homeEntrySupportOf';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { monthSummary } from '@/features/home/utils/monthSummary';
import { paidRowsOf } from '@/features/home/utils/paidRowsOf';
import { splitByMember } from '@/features/home/utils/splitByMember';
import { splitByTag } from '@/features/home/utils/splitByTag';
import { AppText } from '@/shared/components/AppText/AppText';
import { EntryItem } from '@/shared/components/EntryItem/EntryItem';
import { MonthSwitcher } from '@/shared/components/MonthSwitcher/MonthSwitcher';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle/SegmentedToggle';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { dayOf } from '@/shared/utils/date/dayOf';
import { formatCents } from '@/shared/utils/format/formatCents';
import { tagColorRoles } from '@/shared/utils/tag/tagColorRoles';
import { tagNameOf } from '@/shared/utils/tag/tagNameOf';

import { NoBillsPrompt } from './components/NoBillsPrompt/NoBillsPrompt';

const SPLIT_OPTIONS = [
  { value: 'tag', label: 'Por tag' },
  { value: 'member', label: 'Por membro' },
] as const;

/** O mês da família: o anel, a divisão por tag ou por membro e a lista com as contas a pagar e as pagas. */
export function HomePage() {
  const [month, setMonth] = useState(currentMonth);
  const [splitView, setSplitView] = useState<'tag' | 'member'>('tag');
  const { status: billsStatus, data: bills } = useRealtime(recurringBillListQueryService, {});
  const { status: entriesStatus, data: entries } = useRealtime(entryMonthQueryService, { month });
  const { data: tags } = useRealtime(tagListQueryService, {});
  const { data: people } = useRealtime(allowedEmailListQueryService, {});

  const hasError = billsStatus === 'error' || entriesStatus === 'error';
  const summary = bills && entries ? monthSummary({ month, bills, entries }) : null;
  const paidRows = paidRowsOf(summary?.paid ?? []);

  return (
    <Screen>
      <ScreenContent gap="extraLarge">
        <MonthSwitcher month={month} onMonthChange={setMonth} />

        {hasError ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar o mês.
          </AppText>
        ) : null}

        {summary ? (
          <>
            <MonthCard month={month} summary={summary} />

            {bills?.length === 0 ? <NoBillsPrompt /> : null}

            {summary.billCount > 0 ? (
              <View style={styles.split}>
                <SegmentedToggle options={[...SPLIT_OPTIONS]} value={splitView} onChange={setSplitView} />
                <View style={styles.rows}>
                  {splitView === 'tag'
                    ? splitByTag(summary, tags ?? []).map(({ tag, paidCents, toPayCents }) => (
                        <SplitRow
                          key={tag.id}
                          mark="dot"
                          name={tag.name}
                          paidCents={paidCents}
                          monthPaidCents={summary.paidCents}
                          color={tagColorRoles(tag.color).mainRole}
                          detail={toPayCents > 0 ? `e mais ${formatCents(toPayCents)} a pagar` : undefined}
                        />
                      ))
                    : splitByMember(summary.paid, people ?? []).map(({ uid, name, paidCents }) => (
                        <SplitRow
                          key={uid}
                          mark="avatar"
                          name={name}
                          paidCents={paidCents}
                          monthPaidCents={summary.paidCents}
                          color="primary"
                        />
                      ))}
                </View>
              </View>
            ) : null}

            {summary.toPay.length > 0 ? (
              <MonthListSection title="A pagar" count={summary.toPay.length} totalCents={summary.toPayCents}>
                {summary.toPay.map(({ bill, dueDate }) => (
                  <BillToPayItem
                    key={bill.id}
                    name={bill.name}
                    expectedCents={bill.expectedAmountCents}
                    dueDay={dayOf(dueDate)}
                    tagName={tagNameOf(bill.tagId, tags)}
                    onPress={() => router.push({ pathname: '/recurring-bills/[id]/pay', params: { id: bill.id, month } })}
                  />
                ))}
              </MonthListSection>
            ) : null}

            {paidRows.length > 0 ? (
              <MonthListSection title="Pagas" count={paidRows.length} totalCents={summary.paidCents}>
                {paidRows.map((entry) => (
                  <EntryItem
                    key={entry.id}
                    kind={entry.kind === 'recurringPayment' ? 'payment' : 'oneOff'}
                    name={entry.name}
                    amountCents={entry.amountCents}
                    onPress={() => router.push({ pathname: '/entries/[id]', params: { id: entry.id } })}
                    support={homeEntrySupportOf(entry, {
                      memberName: memberNameOf(entry.paidBy, people ?? []),
                      tagName: tagNameOf(entry.tagId, tags),
                    })}
                  />
                ))}
              </MonthListSection>
            ) : null}
          </>
        ) : null}
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  split: { gap: theme.spacing.large },
  rows: { gap: theme.spacing.small },
}));
