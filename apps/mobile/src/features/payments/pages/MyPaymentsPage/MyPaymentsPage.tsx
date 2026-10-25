import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import monthClosed from '@/assets/images/month-closed.png';
import { AppText } from '@/shared/components/AppText/AppText';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { EntryItem } from '@/shared/components/EntryItem/EntryItem';
import { ExtendedFab } from '@/shared/components/ExtendedFab/ExtendedFab';
import { MonthSwitcher } from '@/shared/components/MonthSwitcher/MonthSwitcher';
import { MonthTotalCard } from '@/shared/components/MonthTotalCard/MonthTotalCard';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { myEntrySupportOf } from '@/features/payments/utils/myEntrySupportOf';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { monthName } from '@/shared/utils/date/monthName';
import { tagNameOf } from '@/shared/utils/tag/tagNameOf';

/** Os lançamentos de quem está logado, mês a mês, com o total do mês; o botão registra uma conta avulsa. */
export function MyPaymentsPage() {
  const authState = useAuthState();
  const uid = authState.status === 'signedIn' ? authState.user.uid : null;
  const [month, setMonth] = useState(currentMonth);
  const { status, data: entries } = useRealtime(entryMonthQueryService, { month });
  const { data: tags } = useRealtime(tagListQueryService, {});

  // A leitura traz o mês da família inteira; a lista é só do que quem está logado pagou.
  const mine = entries?.filter((entry) => entry.paidBy === uid);
  const familyAmountCents = entries?.reduce((sum, entry) => sum + entry.amountCents, 0) ?? 0;
  const mineAmountCents = mine?.reduce((sum, entry) => sum + entry.amountCents, 0) ?? 0;

  return (
    <Screen>
      <ScreenContent gap="extraLarge">
        <MonthSwitcher label="Meus pagamentos" month={month} onMonthChange={setMonth} />

        {status === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a lista.
          </AppText>
        ) : null}

        {mine && mine.length > 0 ? (
          <>
            <MonthTotalCard
              month={month}
              amountCents={mineAmountCents}
              entryCount={mine.length}
              familyAmountCents={familyAmountCents}
            />
            <View style={styles.entries}>
              {mine.map((entry) => (
                <EntryItem
                  key={entry.id}
                  kind={entry.kind === 'recurringPayment' ? 'payment' : 'oneOff'}
                  name={entry.name}
                  amountCents={entry.amountCents}
                  onPress={() => router.push({ pathname: '/entries/[id]', params: { id: entry.id } })}
                  // Uma conta com a tag apagada (só pelo SDK) fica sem a tag no detalhe.
                  support={myEntrySupportOf(entry, tagNameOf(entry.tagId, tags))}
                />
              ))}
            </View>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              Toque num lançamento para ver os detalhes e o comprovante.
            </AppText>
          </>
        ) : mine ? (
          <EmptyState
            image={monthClosed}
            title={`Nenhum pagamento seu em ${monthName(month)}`}
            text="Quando você registrar um pagamento ou uma conta avulsa, ele aparece aqui."
          />
        ) : null}

        <View style={styles.action}>
          <ExtendedFab icon={Plus} label="Nova conta avulsa" onPress={() => router.push('/one-off-bills/new')} />
        </View>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  entries: { gap: theme.spacing.extraExtraSmall },
  action: { alignItems: 'flex-end' },
}));
