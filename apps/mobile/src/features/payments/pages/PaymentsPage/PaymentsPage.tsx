import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import monthClosed from '@/assets/images/month-closed.png';
import { EntryTagGroup } from '@/features/payments/components/EntryTagGroup/EntryTagGroup';
import { entryGroupsByTag } from '@/features/payments/utils/entryGroupsByTag';
import { memberChoicesOf } from '@/features/payments/utils/memberChoicesOf';
import { paymentEntrySupportOf } from '@/features/payments/utils/paymentEntrySupportOf';
import { AppText } from '@/shared/components/AppText/AppText';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { EntryItem } from '@/shared/components/EntryItem/EntryItem';
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
import { isOwnedEntry } from '@/shared/utils/entry/isOwnedEntry';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { monthName } from '@/shared/utils/date/monthName';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { tagDisplayOf } from '@/shared/utils/tag/tagDisplayOf';

/**
 * Os lançamentos de uma pessoa da família por vez, ou de todos, escolhidos nos chips (abre em quem está logado), mês a
 * mês e agrupados por tag, com o total no mês; o botão registra uma conta avulsa.
 */
export function PaymentsPage() {
  const authState = useAuthState();
  const uid = authState.status === 'signedIn' ? authState.user.uid : null;
  const [month, setMonth] = useState(currentMonth);
  // A `key` do chip escolhido, independente do mês; antes de tocar num chip, vale quem está logado, o chip "Você".
  const [chosenKey, setChosenKey] = useState<string>();
  const { status, data: monthEntries } = useRealtime(entryMonthQueryService, { month });
  // Até a lista conhecer as contribuições, ela mostra só a conta avulsa e o pagamento com dono.
  const entries = monthEntries?.filter(isOwnedEntry);
  const { status: tagsStatus, data: tags } = useRealtime(tagListQueryService, {});
  const { data: people } = useRealtime(allowedEmailListQueryService, {});

  const choices = uid ? memberChoicesOf(people ?? [], uid) : [];
  // Sem escolha, ou com a pessoa escolhida fora da lista (removida com a tela aberta), vale o chip "Você".
  const chosen = choices.find((choice) => choice.key === chosenKey) ?? choices.find((choice) => choice.key === uid);
  const isEveryone = chosen?.kind === 'everyone';
  const isMine = chosen?.key === uid;
  // A leitura traz o mês da família inteira; a lista é a da pessoa escolhida, ou toda no chip "Todos". Sem as tags, todo
  // lançamento cairia no grupo sem tag: a lista as espera.
  const theirs = chosen?.kind === 'member' ? entries?.filter((entry) => entry.paidBy === chosen.uid) : entries;
  const groups = theirs && tags ? entryGroupsByTag(theirs, tags) : null;
  const hasError = status === 'error' || tagsStatus === 'error';
  const familyAmountCents = entries?.reduce((sum, entry) => sum + entry.amountCents, 0) ?? 0;

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
              ownerName={isEveryone ? 'A família' : chosen.name}
              month={month}
              amountCents={groups.reduce((sum, group) => sum + group.totalCents, 0)}
              entryCount={groups.reduce((count, group) => count + group.entries.length, 0)}
              familyAmountCents={isEveryone ? undefined : familyAmountCents}
            />
            <View style={styles.groups}>
              {groups.map(({ tag, totalCents, entries: groupEntries }) => {
                const { key, name, color } = tagDisplayOf(tag);
                return (
                  <EntryTagGroup key={key} name={name} color={color} totalCents={totalCents}>
                    {groupEntries.map((entry) => (
                      <EntryItem
                        key={entry.id}
                        kind={entry.kind === 'recurringPayment' ? 'payment' : 'oneOff'}
                        name={entry.name}
                        amountCents={entry.amountCents}
                        onPress={() => router.push({ pathname: '/entries/[id]', params: { id: entry.id } })}
                        // No chip "Todos" nenhum chip diz de quem é o lançamento: a linha diz.
                        support={paymentEntrySupportOf(
                          entry,
                          isEveryone ? memberNameOf(entry.paidBy, people ?? []) : undefined,
                        )}
                      />
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

/** O título do mês sem lançamentos: "Nenhum pagamento seu em outubro", "… de Bruno …" ou, no chip "Todos", de ninguém. */
function emptyTitleOf(name: string, month: string, { isMine, isEveryone }: { isMine: boolean; isEveryone: boolean }) {
  if (isEveryone) return `Nenhum pagamento em ${monthName(month)}`;
  return `Nenhum pagamento ${isMine ? 'seu' : `de ${name}`} em ${monthName(month)}`;
}

const styles = StyleSheet.create((theme) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.small },
  groups: { gap: theme.spacing.large },
}));
