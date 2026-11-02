import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import type { IEntryMarkKind } from '@/shared/types/entry/EntryMarkKind';
import { entryMarkOf } from '@/shared/utils/entry/entryMarkOf';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IEntryDetailsHeaderProps {
  markKind: IEntryMarkKind;
  /** O nome da conta. */
  title: string;
  /** O tipo e o mês: "Pagamento de outubro de 2026", "Conta avulsa". */
  subtitle: string;
  amountCents: number;
  /** A linha embaixo do valor: o previsto, ou a conta que a contribuição recebe. */
  amountSupport?: string;
}

/** O topo da folha de detalhes: a marca, o nome da conta, o tipo e o valor, com a linha que o explica. */
export function EntryDetailsHeader({
  markKind,
  title,
  subtitle,
  amountCents,
  amountSupport,
}: IEntryDetailsHeaderProps) {
  const { theme } = useUnistyles();
  const { icon: Icon, markColor, iconColor } = entryMarkOf(markKind);

  return (
    <>
      <View style={styles.header}>
        <CircleMark size={40} color={markColor}>
          <Icon size={20} color={theme.colors[iconColor]} />
        </CircleMark>
        <View style={styles.title}>
          <AppText variant="titleLarge" numberOfLines={2}>
            {title}
          </AppText>
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            {subtitle}
          </AppText>
        </View>
      </View>

      <View style={styles.amount}>
        <AppText variant="headlineMediumEmphasized">{formatCents(amountCents)}</AppText>
        {amountSupport ? (
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {amountSupport}
          </AppText>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.mediumIncreased },
  title: { flex: 1, gap: theme.spacing.extraExtraSmall },
  amount: { gap: theme.spacing.extraExtraSmall },
}));
