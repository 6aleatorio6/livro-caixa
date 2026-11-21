import { router, useFocusEffect } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { BillToPayItem } from '@/features/home/components/BillToPayItem/BillToPayItem';
import { MonthCard } from '@/features/home/components/MonthCard/MonthCard';
import { MonthListSection } from '@/features/home/components/MonthListSection/MonthListSection';
import { SkippedBillItem } from '@/features/home/components/SkippedBillItem/SkippedBillItem';
import { SplitRow } from '@/features/home/components/SplitRow/SplitRow';
import { useOpenPendingShare } from '@/features/home/hooks/useOpenPendingShare/useOpenPendingShare';
import { useMonthSummary } from '@/features/home/hooks/useMonthSummary/useMonthSummary';
import { homeEntryBadgeOf } from '@/features/home/utils/homeEntryBadgeOf';
import { homeEntrySupportOf } from '@/features/home/utils/homeEntrySupportOf';
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
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { dayOf } from '@/shared/utils/date/dayOf';
import { billAmountOf } from '@/shared/utils/entry/billAmountOf';
import { contributionsSupportOf } from '@/shared/utils/entry/contributionsSupportOf';
import { entryMarkKindOf } from '@/shared/utils/entry/entryMarkKindOf';
import { memberPartsOf } from '@/shared/utils/entry/memberPartsOf';
import { formatCents } from '@/shared/utils/format/formatCents';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { tagDisplayOf } from '@/shared/utils/tag/tagDisplayOf';
import { findTag } from '@/shared/utils/tag/findTag';
import { checkAppVersion } from '@/shared/utils/version/checkAppVersion';

import { NoBillsPrompt } from './components/NoBillsPrompt/NoBillsPrompt';

const SPLIT_OPTIONS = [
  { value: 'tag', label: 'Por tag' },
  { value: 'member', label: 'Por membro' },
] as const;

/** Abre o registro do pagamento da conta no mês dela, que na atrasada é um mês anterior ao da tela. */
function openPayment(billId: string, billMonth: string) {
  router.push({ pathname: '/recurring-bills/[id]/pay', params: { id: billId, month: billMonth } });
}

/** O mês da família: o anel, a divisão por tag ou por membro e a lista com as contas a pagar e as pagas. */
export function HomePage() {
  useOpenPendingShare();
  // O mínimo pode subir com o app aberto: voltar ao Início confere de novo. O efeito não devolve a promessa da conferência.
  useFocusEffect(() => {
    checkAppVersion();
  });
  // "Este mês" é o da abertura da tela, mesmo que a meia-noite do último dia passe com ela aberta.
  const [thisMonth] = useState(currentMonth);
  const [month, setMonth] = useState(thisMonth);
  const [splitView, setSplitView] = useState<'tag' | 'member'>('tag');
  const { bills, summary, hasError } = useMonthSummary({ month, currentMonth: thisMonth });
  const { data: tags } = useRealtime(tagListQueryService, {});
  const { data: people } = useRealtime(allowedEmailListQueryService, {});

  const paidRows = paidRowsOf(summary?.paid ?? []);
  // A soma das linhas pagas: sem as contribuições das contas ainda a pagar, que o cartão do mês conta no pago.
  const paidRowsCents = summary
    ? paidRows.reduce((total, entry) => total + billAmountOf(entry, summary.entries), 0)
    : 0;

  return (
    <Screen>
      <ScreenContent gap="extraLarge">
        <MonthSwitcher label="Início" month={month} onMonthChange={setMonth} />

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
                  {/* Sem a lista de tags, toda conta cairia na linha Sem tag: a divisão espera as tags chegarem. */}
                  {splitView === 'tag'
                    ? (tags ? splitByTag(summary, tags) : []).map(({ tag, paidCents, toPayCents }) => {
                        const { key, name, color } = tagDisplayOf(tag);
                        return (
                          <SplitRow
                            key={key}
                            mark="dot"
                            name={name}
                            paidCents={paidCents}
                            monthPaidCents={summary.paidCents}
                            color={color}
                            detail={toPayCents > 0 ? `e mais ${formatCents(toPayCents)} a pagar` : undefined}
                          />
                        );
                      })
                    : splitByMember(memberPartsOf(summary.entries), people ?? []).map(({ uid, name, paidCents }) => (
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
              <MonthListSection
                title="A pagar"
                summary={{ count: summary.toPay.length, totalCents: summary.toPayCents }}
              >
                {/* O mês da conta, não o da tela: a atrasada do mês atual é de um mês anterior. */}
                {summary.toPay.map(
                  ({ bill, month: billMonth, name, tagId, dueDate, contributions, remainingCents, overdue }) => (
                    <BillToPayItem
                      key={`${billMonth}_${bill.id}`}
                      name={name}
                      remainingCents={remainingCents}
                      dueDay={dayOf(dueDate)}
                      contributionsSupport={contributionsSupportOf(contributions, people ?? [])}
                      tag={findTag(tagId, tags)}
                      billMonth={billMonth}
                      overdue={overdue}
                      onPress={() => openPayment(bill.id, billMonth)}
                    />
                  ),
                )}
              </MonthListSection>
            ) : null}

            {summary.skipped.length > 0 ? (
              <MonthListSection title="Puladas" summary={{ count: summary.skipped.length }}>
                {summary.skipped.map(({ recurringBillId, month: billMonth, name, tagId, createdBy }) => (
                  <SkippedBillItem
                    key={recurringBillId}
                    name={name}
                    skippedByName={memberNameOf(createdBy, people ?? [])}
                    tag={findTag(tagId, tags)}
                    onPress={() => openPayment(recurringBillId, billMonth)}
                  />
                ))}
              </MonthListSection>
            ) : null}

            {paidRows.length > 0 ? (
              <MonthListSection title="Pagas" summary={{ count: paidRows.length, totalCents: paidRowsCents }}>
                {paidRows.map((entry) => (
                  <EntryItem
                    key={entry.id}
                    kind={entryMarkKindOf(entry)}
                    name={entry.name}
                    tag={findTag(entry.tagId, tags)}
                    badge={homeEntryBadgeOf(entry)}
                    amountCents={billAmountOf(entry, summary.entries)}
                    onPress={() => router.push({ pathname: '/entries/[id]', params: { id: entry.id } })}
                    support={homeEntrySupportOf(entry, summary.entries, people ?? [])}
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
