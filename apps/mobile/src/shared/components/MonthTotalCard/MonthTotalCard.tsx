import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { monthName } from '@/shared/utils/date/monthName';
import { formatCents } from '@/shared/utils/format/formatCents';
import { pluralize } from '@/shared/utils/format/pluralize';

export interface IMonthTotalCardProps {
  /** O mês do total, 'AAAA-MM'. */
  month: string;
  /** Quanto a pessoa registrou no mês, em centavos. */
  amountCents: number;
  entryCount: number;
  /** Quanto a família pagou no mês, em centavos; a base da porcentagem. */
  familyAmountCents: number;
}

/** O total que a pessoa registrou no mês: o valor grande e "2 lançamentos · 71% do que a família pagou". */
export function MonthTotalCard({ month, amountCents, entryCount, familyAmountCents }: IMonthTotalCardProps) {
  const percent = familyAmountCents > 0 ? Math.floor((amountCents / familyAmountCents) * 100) : 0;

  return (
    <View style={styles.card}>
      <AppText variant="labelLarge" color="onSurfaceVariant">
        Você registrou em {monthName(month)}
      </AppText>
      <AppText variant="headlineLargeEmphasized" color="primary">
        {formatCents(amountCents)}
      </AppText>
      <AppText variant="bodySmall" color="onSurfaceVariant">
        {pluralize(entryCount, 'lançamento', 'lançamentos')} · {percent}% do que a família pagou
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
