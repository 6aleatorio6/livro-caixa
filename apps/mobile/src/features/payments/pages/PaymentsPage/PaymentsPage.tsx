import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import monthClosed from '@/assets/images/month-closed.png';
import { EntryTagGroup } from '@/features/payments/components/EntryTagGroup/EntryTagGroup';
import { PaymentRow } from '@/features/payments/components/PaymentRow/PaymentRow';
import { chipSelectionOf } from '@/features/payments/utils/chipSelectionOf';
import { emptyTitleOf } from '@/features/payments/utils/emptyTitleOf';
import { entryGroupsByTag } from '@/features/payments/utils/entryGroupsByTag';
import { markedUidsAfterPress } from '@/features/payments/utils/markedUidsAfterPress';
import { memberChoicesOf } from '@/features/payments/utils/memberChoicesOf';
import { paymentRowsOf } from '@/features/payments/utils/paymentRowsOf';
import { totalTitleOf } from '@/features/payments/utils/totalTitleOf';
import { AppText } from '@/shared/components/AppText/AppText';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ExtendedFab } from '@/shared/components/ExtendedFab/ExtendedFab';
import { FilterChip } from '@/shared/components/FilterChip/FilterChip';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { MonthSwitcher } from '@/shared/components/MonthSwitcher/MonthSwitcher';
import { MonthTotalCard } from '@/shared/components/MonthTotalCard/MonthTotalCard';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { signedInUid } from '@/shared/utils/auth/signedInUid';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { memberPartsOf } from '@/shared/utils/entry/memberPartsOf';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { tagDisplayOf } from '@/shared/utils/tag/tagDisplayOf';

/**
 * As partes das pessoas marcadas nos chips (abre em quem está logado; "Todos" marca todas), mês a mês e agrupadas por
 * tag, com o total no mês. Cada parte é uma linha: a de quem pagou conta o valor pago menos as contribuições, e cada
 * contribuição é a sua. O botão registra uma conta avulsa.
 */
export function PaymentsPage() {
  const uid = signedInUid(useAuthState());
  const [month, setMonth] = useState(currentMonth);
  // Os uids que a pessoa marcou, independentes do mês; o que vale é a seleção derivada deles, com "Você" quando nenhum
  // sobra (nada tocado, ou quem estava marcado saiu da lista).
  const [markedUids, setMarkedUids] = useState<ReadonlySet<string>>(() => new Set());
  const { status, data: entries } = useRealtime(entryMonthQueryService, { month });
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});
  const { data: people } = useRealtime(allowedEmailListQueryService, {});

  const choices = uid ? memberChoicesOf(people ?? [], uid) : [];
  const selection = uid ? chipSelectionOf(markedUids, choices, uid) : null;
  // A leitura traz o mês da família inteiro; as partes dele, calculadas uma vez, dão a lista e a base da porcentagem.
  const parts = entries ? memberPartsOf(entries) : null;
  // A lista é a das partes das pessoas marcadas. Sem as tags, toda conta cairia no grupo sem tag: ela as espera.
  const rows = parts && selection ? paymentRowsOf(parts, selection.rowUids) : null;
  const groups = rows && tags ? entryGroupsByTag(rows, tags) : null;
  const hasError = status === 'error' || tagsStatus === 'error';
  // A base da porcentagem é o mesmo pago do Início: a soma das partes de todos.
  const familyAmountCents = parts ? sumCents(parts) : 0;

  return (
    <Screen>
      <ScreenContent gap="extraLarge" hasFloatingButton>
        <MonthSwitcher label="Pagamentos" month={month} onMonthChange={setMonth} />

        <View style={styles.chips}>
          {selection
            ? choices.map((choice) => (
                <FilterChip
                  key={choice.key}
                  label={choice.name}
                  isSelected={
                    choice.kind === 'everyone' ? selection.kind === 'everyone' : selection.markedUids.has(choice.uid)
                  }
                  onPress={() => setMarkedUids(markedUidsAfterPress(selection.markedUids, choice, choices))}
                />
              ))
            : null}
        </View>

        {hasError ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a lista.
          </AppText>
        ) : !groups || !selection ? (
          <LoadingState />
        ) : groups.length === 0 ? (
          // O texto de baixo diz o que a própria pessoa faz para algo aparecer: não vale para outro membro.
          <EmptyState
            image={monthClosed}
            title={emptyTitleOf(selection, month)}
            text={
              selection.kind === 'me' || selection.kind === 'everyone'
                ? 'Quando você registrar um pagamento ou uma conta avulsa, ele aparece aqui.'
                : undefined
            }
          />
        ) : (
          <>
            <MonthTotalCard
              title={totalTitleOf(selection, month)}
              amountCents={groups.reduce((sum, group) => sum + group.totalCents, 0)}
              entryCount={groups.reduce((count, group) => count + group.rows.length, 0)}
              familyAmountCents={selection.kind === 'everyone' ? undefined : familyAmountCents}
            />
            <View style={styles.groups}>
              {groups.map(({ tag, totalCents, rows: groupRows }) => {
                const { key, name, color } = tagDisplayOf(tag);
                return (
                  <EntryTagGroup key={key} name={name} color={color} totalCents={totalCents}>
                    {groupRows.map((row) => (
                      <PaymentRow key={row.key} row={row} people={people ?? []} selection={selection} />
                    ))}
                  </EntryTagGroup>
                );
              })}
            </View>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Toque num lançamento para ver os detalhes e o comprovante.
            </AppText>
          </>
        )}
      </ScreenContent>
      <ExtendedFab icon={Plus} label="Nova conta avulsa" onPress={() => router.push('/one-off-bills/new')} />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.small },
  groups: { gap: theme.spacing.large },
}));
