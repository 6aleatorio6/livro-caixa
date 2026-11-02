import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { formatCents } from '@/shared/utils/format/formatCents';
import { pluralize } from '@/shared/utils/format/pluralize';

export interface IMonthTotalCardProps {
  /** O que o total é, com o mês: "Sua parte em outubro", "Parte de Bruno em outubro", "A família registrou em outubro". */
  title: string;
  /** O total, em centavos. */
  amountCents: number;
  entryCount: number;
  /** Quanto a família pagou no mês, em centavos; a base da porcentagem. Sem ele, não há porcentagem. */
  familyAmountCents?: number;
}

/**
 * O total do mês: o valor grande e "2 lançamentos · 71% do que a família pagou"; o da família inteira, só
 * "4 lançamentos".
 */
export function MonthTotalCard({ title, amountCents, entryCount, familyAmountCents }: IMonthTotalCardProps) {
  const percent = familyAmountCents ? Math.floor((amountCents / familyAmountCents) * 100) : 0;
  const detail = [
    pluralize(entryCount, 'lançamento', 'lançamentos'),
    familyAmountCents === undefined ? undefined : `${percent}% do que a família pagou`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.card}>
      <AppText variant="labelLarge" color="onSurfaceVariant">
        {title}
      </AppText>
      <AppText variant="headlineLargeEmphasized" color="primary">
        {formatCents(amountCents)}
      </AppText>
      <AppText variant="bodySmall" color="onSurfaceVariant">
        {detail}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing.extraSmall,
    padding: theme.spacing.largeIncreased,
    borderRadius: theme.radii.extraLarge,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
}));
