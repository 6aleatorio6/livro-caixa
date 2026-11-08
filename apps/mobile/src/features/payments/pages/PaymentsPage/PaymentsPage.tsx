import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import monthClosed from '@/assets/images/month-closed.png';
import { EntryTagGroup } from '@/features/payments/components/EntryTagGroup/EntryTagGroup';
import { PaymentRow } from '@/features/payments/components/PaymentRow/PaymentRow';
import { entryGroupsByTag } from '@/features/payments/utils/entryGroupsByTag';
import { memberChoicesOf } from '@/features/payments/utils/memberChoicesOf';
import { paymentRowsOf } from '@/features/payments/utils/paymentRowsOf';
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
import { monthName } from '@/shared/utils/date/monthName';
import { memberPartsOf } from '@/shared/utils/entry/memberPartsOf';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { tagDisplayOf } from '@/shared/utils/tag/tagDisplayOf';

/**
 * As partes de uma pessoa da família por vez, ou de todos, escolhidas nos chips (abre em quem está logado), mês a mês
 * e agrupadas por tag, com o total no mês. Cada parte é uma linha: a de quem pagou conta o valor pago menos as
 * contribuições, e cada contribuição é a sua. O botão registra uma conta avulsa.
 */
export function PaymentsPage() {
  const uid = signedInUid(useAuthState());
  const [month, setMonth] = useState(currentMonth);
  // A `key` do chip escolhido, independente do mês; antes de tocar num chip, vale quem está logado, o chip "Você".
  const [chosenKey, setChosenKey] = useState<string>();
  const { status, data: entries } = useRealtime(entryMonthQueryService, { month });
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});
  const { data: people } = useRealtime(allowedEmailListQueryService, {});

  const choices = uid ? memberChoicesOf(people ?? [], uid) : [];
  // Sem escolha, ou com a pessoa escolhida fora da lista (removida com a tela aberta), vale o chip "Você".
  const chosen = choices.find((choice) => choice.key === chosenKey) ?? choices.find((choice) => choice.key === uid);
  const isEveryone = chosen?.kind === 'everyone';
  const isMine = chosen?.key === uid;
  const chosenUid = chosen?.kind === 'member' ? chosen.uid : null;
  // Ponte até os chips de várias pessoas: o conjunto de quem está marcado ainda é a escolha única, ou todas as pessoas
  // em "Todos".
  const selectedUids = new Set(
    chosenUid !== null ? [chosenUid] : choices.flatMap((choice) => (choice.kind === 'member' ? [choice.uid] : [])),
  );
  // A leitura traz o mês da família inteira; a lista é a das partes da pessoa escolhida, ou de todas no chip "Todos".
  // Sem as tags, toda conta cairia no grupo sem tag: a lista as espera.
  const rows = entries && chosen ? paymentRowsOf(entries, selectedUids) : null;
  const groups = rows && tags ? entryGroupsByTag(rows, tags) : null;
  const hasError = status === 'error' || tagsStatus === 'error';
  // A base da porcentagem é o mesmo pago do Início: a soma das partes de todos.
  const familyAmountCents = entries ? sumCents(memberPartsOf(entries)) : 0;

  return (
    <Screen>
      <ScreenContent gap="extraLarge">
        <MonthSwitcher label="Pagamentos" month={month} onMonthChange={setMonth} />

        <View style={styles.chips}>
          {choices.map((choice) => (
            <FilterChip
              key={choice.key}
              label={choice.name}
              isSelected={choice.key === chosen?.key}
              onPress={() => setChosenKey(choice.key)}
            />
          ))}
        </View>

        {hasError ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a lista.
          </AppText>
        ) : !groups || !chosen ? (
          <LoadingState />
        ) : groups.length === 0 ? (
          // O texto de baixo diz o que a própria pessoa faz para algo aparecer: não vale para outro membro.
          <EmptyState
            image={monthClosed}
            title={emptyTitleOf(chosen.name, month, { isMine, isEveryone })}
            text={
              isMine || isEveryone ? 'Quando você registrar um pagamento ou uma conta avulsa, ele aparece aqui.' : undefined
            }
          />
        ) : (
          <>
            <MonthTotalCard
              title={totalTitleOf(chosen.name, month, { isMine, isEveryone })}
              amountCents={groups.reduce((sum, group) => sum + group.totalCents, 0)}
              entryCount={groups.reduce((count, group) => count + group.rows.length, 0)}
              familyAmountCents={isEveryone ? undefined : familyAmountCents}
            />
            <View style={styles.groups}>
              {groups.map(({ tag, totalCents, rows: groupRows }) => {
                const { key, name, color } = tagDisplayOf(tag);
                return (
                  <EntryTagGroup key={key} name={name} color={color} totalCents={totalCents}>
                    {groupRows.map((row) => (
                      <PaymentRow key={row.key} row={row} people={people ?? []} chosenUid={chosenUid} />
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

/** O título do cartão do total: "Sua parte em outubro", "Parte de Bruno em outubro" ou "A família registrou em outubro". */
function totalTitleOf(name: string, month: string, { isMine, isEveryone }: { isMine: boolean; isEveryone: boolean }) {
  if (isEveryone) return `A família registrou em ${monthName(month)}`;
  return `${isMine ? 'Sua parte' : `Parte de ${name}`} em ${monthName(month)}`;
}

/** O título do mês sem lançamentos: "Nenhum pagamento seu em outubro", "… de Bruno …" ou, no chip "Todos", de ninguém. */
function emptyTitleOf(name: string, month: string, { isMine, isEveryone }: { isMine: boolean; isEveryone: boolean }) {
  if (isEveryone) return `Nenhum pagamento em ${monthName(month)}`;
  return `Nenhum pagamento ${isMine ? 'seu' : `de ${name}`} em ${monthName(month)}`;
}

const styles = StyleSheet.create((theme) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.small },
  groups: { gap: theme.spacing.large },
}));
