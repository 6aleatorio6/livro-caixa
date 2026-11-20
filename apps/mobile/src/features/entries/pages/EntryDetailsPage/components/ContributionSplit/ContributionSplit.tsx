import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IContributionSplitProps {
  /** Quem pagou, como o rótulo o chama: "Você" ou o nome do membro. */
  payerName: string;
  /** O que fica com quem pagou: o valor pago menos as contribuições. Negativo quando elas passam do pago. */
  payerCents: number;
  /** A soma das contribuições. */
  contributedCents: number;
}

/**
 * A divisão do valor pago, embaixo do previsto: o nome e o valor de cada parte nas pontas e, embaixo, uma barra de duas
 * partes na proporção dos centavos. A parte de quem pagou, zerada ou negativa, some da barra (com ela, o vão entre as
 * partes), e o rótulo mostra o valor como é. Um nome longo (o e-mail de quem ainda não tem nome) encurta com
 * reticências, para não empurrar as contribuições para fora da linha.
 */
export function ContributionSplit({ payerName, payerCents, contributedCents }: IContributionSplitProps) {
  const payerAmount = formatCents(payerCents);
  const contributedAmount = formatCents(contributedCents);

  return (
    <View
      accessible
      accessibilityLabel={`${payerName} fica com ${payerAmount}; as contribuições somam ${contributedAmount}`}
      style={styles.container}
    >
      <View style={styles.labels}>
        <View style={styles.payerLabel}>
          <AppText variant="bodyMedium" color="onSurfaceVariant" numberOfLines={1} style={styles.payerName}>
            {payerName}
          </AppText>
          <AppText variant="bodyMediumEmphasized">{payerAmount}</AppText>
        </View>
        <View style={styles.label}>
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Contribuições
          </AppText>
          <AppText variant="bodyMediumEmphasized">{contributedAmount}</AppText>
        </View>
      </View>
      <Decorative style={styles.track}>
        {payerCents > 0 ? <View style={styles.part(payerCents, 'primary')} /> : null}
        <View style={styles.part(contributedCents, 'tertiary')} />
      </Decorative>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { paddingTop: theme.spacing.medium, gap: theme.spacing.extraSmallIncreased },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.large },
  payerLabel: { flexShrink: 1, flexDirection: 'row', gap: theme.spacing.extraSmallIncreased },
  payerName: { flexShrink: 1 },
  label: { flexDirection: 'row', gap: theme.spacing.extraSmallIncreased },
  track: { flexDirection: 'row', height: 8, gap: theme.spacing.extraExtraSmall }, // a altura do design, sem token
  part: (cents: number, color: 'primary' | 'tertiary') => ({
    flex: cents,
    borderRadius: theme.radii.extraSmall,
    backgroundColor: theme.colors[color],
  }),
}));
