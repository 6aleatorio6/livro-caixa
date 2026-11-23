import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import type { IAuthoredEntry } from '@/shared/types/entry/AuthoredEntry';
import type { IAuthoredEntryOfKind } from '@/shared/types/entry/AuthoredEntryOfKind';
import type { IOwnedPaymentEntry } from '@/shared/types/entry/OwnedPaymentEntry';
import { formatContributionTitle } from '@/shared/utils/date/formatContributionTitle';
import { formatIsoDate } from '@/shared/utils/date/formatIsoDate';
import { formatPaymentTitle } from '@/shared/utils/date/formatPaymentTitle';
import { paidBillMonthOf } from '@/shared/utils/entry/paidBillMonthOf';
import { formatCents } from '@/shared/utils/format/formatCents';

// O pagamento atrasado diz o mês da conta, não o mês em que foi pago.
const paymentStrip = (entry: IOwnedPaymentEntry, authorName: string) => ({
  title: entry.name,
  origin: `${formatPaymentTitle(paidBillMonthOf(entry))} · registrado por ${authorName} em ${formatIsoDate(entry.paidOn)}`,
});

// A contribuição não tem nome: a faixa diz que é uma, e o nome da conta fica nos detalhes dela.
const STRIP_BY_KIND: {
  [TKind in IAuthoredEntry['kind']]: (
    entry: IAuthoredEntryOfKind<TKind>,
    authorName: string,
  ) => { title: string; origin: string };
} = {
  recurringPayment: paymentStrip,
  overduePayment: paymentStrip,
  oneOffBill: (entry, authorName) => ({
    title: entry.name,
    origin: `Conta avulsa de ${formatIsoDate(entry.date)} · registrada por ${authorName}`,
  }),
  contribution: (entry, authorName) => ({
    title: 'Contribuição',
    origin: `${formatContributionTitle(entry.month)} · registrada por ${authorName} em ${formatIsoDate(entry.paidOn)}`,
  }),
};

function stripOf<TKind extends IAuthoredEntry['kind']>(entry: IAuthoredEntryOfKind<TKind>, authorName: string) {
  return STRIP_BY_KIND[entry.kind as TKind](entry, authorName);
}

export interface IReceiptEntryStripProps {
  entry: IAuthoredEntry;
  /** O primeiro nome de quem registrou. */
  authorName: string;
}

/** A faixa "Dados do lançamento" embaixo do comprovante: de que lançamento é, quanto, quem registrou e quando. */
export function ReceiptEntryStrip({ entry, authorName }: IReceiptEntryStripProps) {
  const { title, origin } = stripOf(entry, authorName);

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
