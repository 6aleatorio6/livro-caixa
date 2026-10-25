import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { formatCents } from '@/shared/utils/format/formatCents';
import { pluralize } from '@/shared/utils/format/pluralize';

export interface IMonthListSectionProps {
  /** "A pagar" ou "Pagas". */
  title: string;
  count: number;
  totalCents: number;
  children: ReactNode;
}

/** Uma seção da lista do mês: o título, o resumo "2 contas · R$ 217,90" e as linhas. */
export function MonthListSection({ title, count, totalCents, children }: IMonthListSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="titleMediumEmphasized" accessibilityRole="header">
          {title}
        </AppText>
        <AppText variant="labelMedium" color="onSurfaceVariant">
          {pluralize(count, 'conta', 'contas')} · {formatCents(totalCents)}
        </AppText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.spacing.extraExtraSmall },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.extraSmallIncreased,
  },
}));
