import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { formatCents } from '@/shared/utils/format/formatCents';
import { pluralize } from '@/shared/utils/format/pluralize';

export interface IMonthListSectionProps {
  /** "A pagar" ou "Pagas". */
  title: string;
  /** O resumo "2 contas · R$ 217,90" ao lado do título; sem ele só o título. */
  summary?: { count: number; totalCents: number };
  children: ReactNode;
}

/** Uma seção da lista do mês: o título, o resumo "2 contas · R$ 217,90" (quando dado) e as linhas. */
export function MonthListSection({ title, summary, children }: IMonthListSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header(Boolean(summary))}>
        <AppText variant="titleMediumEmphasized" accessibilityRole="header">
          {title}
        </AppText>
        {summary ? (
          <AppText variant="labelMedium" color="onSurfaceVariant">
            {pluralize(summary.count, 'conta', 'contas')} · {formatCents(summary.totalCents)}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.spacing.extraExtraSmall },
  header: (hasSummary: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: hasSummary ? theme.spacing.extraSmallIncreased : 0,
  }),
}));
