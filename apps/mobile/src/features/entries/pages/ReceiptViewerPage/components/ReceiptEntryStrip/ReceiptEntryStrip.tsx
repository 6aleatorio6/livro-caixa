import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import type { IAuthoredEntry } from '@/shared/types/entry/AuthoredEntry';
import { formatContributionTitle } from '@/shared/utils/date/formatContributionTitle';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { formatPaymentTitle } from '@/shared/utils/date/formatPaymentTitle';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IReceiptEntryStripProps {
  entry: IAuthoredEntry;
  /** O primeiro nome de quem registrou. */
  authorName: string;
}

/** A faixa "Dados do lançamento" embaixo do comprovante: de que lançamento é, quanto, quem registrou e quando. */
export function ReceiptEntryStrip({ entry, authorName }: IReceiptEntryStripProps) {
  const origin =
    entry.kind === 'recurringPayment'
      ? `${formatPaymentTitle(entry.month)} · registrado por ${authorName} em ${formatIsoDate(entry.paidOn)}`
      : entry.kind === 'oneOffBill'
        ? `Conta avulsa de ${formatIsoDate(entry.date)} · registrada por ${authorName}`
        : `${formatContributionTitle(entry.month)} · registrada por ${authorName} em ${formatIsoDate(entry.paidOn)}`;
  // A contribuição não tem nome: a faixa diz que é uma, e o nome da conta fica nos detalhes dela.
  const title = entry.kind === 'contribution' ? 'Contribuição' : entry.name;

  return (
    <View style={styles.strip}>
      <AppText variant="titleMedium">{`${title} · ${formatCents(entry.amountCents)}`}</AppText>
      <AppText variant="bodySmall" color="onSurfaceVariant">
        {origin}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  strip: {
    gap: theme.spacing.extraExtraSmall,
    paddingTop: theme.spacing.large,
    paddingHorizontal: theme.spacing.largeIncreased,
    paddingBottom: theme.spacing.extraLargeIncreased,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
}));
