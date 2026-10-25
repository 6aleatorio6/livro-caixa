import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import { DonutChart } from '@/shared/components/DonutChart/DonutChart';
import { monthName } from '@/shared/utils/date/monthName';
import { formatCents } from '@/shared/utils/format/formatCents';

import type { IMonthSummary } from '@/features/home/types/MonthSummary';

export interface IMonthCardProps {
  /** O mês do cartão, 'AAAA-MM'. */
  month: string;
  /** O mês da família: o pago, o a pagar, o total e quantas contas ele tem (zero é o mês sem contas). */
  summary: IMonthSummary;
}

/** Como o centro do anel se escreve: o mês sem contas, o fechado (nada a pagar) e o aberto. */
function centerOf(state: 'empty' | 'closed' | 'open', { month, summary }: IMonthCardProps) {
  const name = monthName(month);

  if (state === 'empty') {
    return { label: `${name.charAt(0).toUpperCase()}${name.slice(1)}`, value: 'Sem contas', count: 'Nenhuma conta neste mês' };
  }
  if (state === 'closed') {
    return { label: 'Mês fechado', value: 'Tudo pago', count: `${summary.billCount} de ${summary.billCount} contas` };
  }
  return {
    label: 'Falta pagar',
    value: formatCents(summary.toPayCents),
    count: `${summary.toPay.length} de ${summary.billCount} contas`,
  };
}

/** O cartão do mês: o anel com o que falta pagar no centro (ou "Mês fechado" / "Sem contas") e a legenda "Já pago" e "Total do mês". */
export function MonthCard({ month, summary }: IMonthCardProps) {
  const { paidCents, totalCents } = summary;
  const state = summary.billCount === 0 ? 'empty' : summary.toPay.length === 0 ? 'closed' : 'open';
  const { label, value, count } = centerOf(state, { month, summary });

  return (
    <View style={styles.card}>
      <DonutChart
        paidCents={paidCents}
        totalCents={totalCents}
        accessibilityLabel={`Já pago ${formatCents(paidCents)} de ${formatCents(totalCents)}`}
      >
        <AppText variant="labelLarge" color="onSurfaceVariant">
          {label}
        </AppText>
        <AppText variant="headlineLargeEmphasized" color={state === 'empty' ? 'onSurfaceVariant' : 'onSurface'}>
          {value}
        </AppText>
        <AppText variant="bodySmall" color="onSurfaceVariant">
          {count}
        </AppText>
      </DonutChart>
      <View style={styles.legend}>
        <View style={styles.legendCard}>
          <View style={styles.legendLabel}>
            <Decorative style={styles.dot} />
            <AppText variant="labelMedium" color="onSurfaceVariant">
              Já pago
            </AppText>
          </View>
          <AppText variant="titleMediumEmphasized">{formatCents(paidCents)}</AppText>
        </View>
        <View style={styles.legendCard}>
          <AppText variant="labelMedium" color="onSurfaceVariant">
            Total do mês
          </AppText>
          <AppText variant="titleMediumEmphasized">{formatCents(totalCents)}</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    alignItems: 'center',
    gap: theme.spacing.largeIncreased,
    padding: theme.spacing.extraLarge,
    borderRadius: theme.radii.extraLarge,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  legend: { flexDirection: 'row', alignSelf: 'stretch', gap: theme.spacing.medium },
  legendCard: {
    flex: 1,
    gap: theme.spacing.extraSmall,
    padding: theme.spacing.mediumIncreased,
    borderRadius: 18, // o raio do design, sem token
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  legendLabel: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.extraSmallIncreased },
  dot: {
    width: 10, // a bolinha do design, sem token
    height: 10,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
  },
}));
