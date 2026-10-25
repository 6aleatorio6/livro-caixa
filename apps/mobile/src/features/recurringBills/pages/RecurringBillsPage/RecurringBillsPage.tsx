import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { BillItem } from '@/shared/components/BillItem/BillItem';
import { ExtendedFab } from '@/shared/components/ExtendedFab/ExtendedFab';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { formatCents } from '@/shared/utils/format/formatCents';
import { recurringBillCount } from '@/shared/utils/format/recurringBillCount';
import { totalExpectedCents } from '@/shared/utils/recurringBill/totalExpectedCents';

/** As contas recorrentes da família, com o previsto por mês; o toque numa conta abre a alteração. */
export function RecurringBillsPage() {
  const { status, data: bills } = useRealtime(recurringBillListQueryService, {});
  const { data: tags } = useRealtime(tagListQueryService, {});

  return (
    <Screen>
      <TopBar title="Contas recorrentes" />
      <ScreenContent gap="large">
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          Cada conta aparece como a pagar todo mês, até alguém registrar o pagamento.
        </AppText>

        {status === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a lista.
          </AppText>
        ) : null}

        {!bills && status !== 'error' ? <LoadingState /> : null}

        {bills ? (
          <View style={styles.total}>
            <AppText variant="labelLarge" color="onSurfaceVariant">
              Previsto por mês
            </AppText>
            <AppText variant="headlineMediumEmphasized">{formatCents(totalExpectedCents(bills))}</AppText>
            <AppText variant="bodySmall" color="onSurfaceVariant">
              {recurringBillCount(bills.length)}
            </AppText>
          </View>
        ) : null}

        {bills ? (
          <View style={styles.bills}>
            {bills.map((bill) => (
              <BillItem
                key={bill.id}
                name={bill.name}
                amountCents={bill.expectedAmountCents}
                dayOfMonth={bill.dayOfMonth}
                // Uma conta com a tag apagada (só pelo SDK) mostra só o dia.
                tagName={tags?.find((tag) => tag.id === bill.tagId)?.name}
                onPress={() => router.push(`/recurring-bills/${bill.id}`)}
              />
            ))}
          </View>
        ) : null}

      </ScreenContent>
      <ExtendedFab icon={Plus} label="Nova conta recorrente" onPress={() => router.push('/recurring-bills/new')} />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  total: {
    gap: theme.spacing.extraSmall,
    padding: theme.spacing.largeIncreased,
    borderRadius: theme.radii.largeIncreased,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  bills: { gap: theme.spacing.extraExtraSmall },
}));
