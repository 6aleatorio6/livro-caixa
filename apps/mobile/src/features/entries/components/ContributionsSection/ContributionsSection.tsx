import { HandCoins } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { EntryReceipt } from '@/features/entries/components/EntryReceipt/EntryReceipt';
import { AppText } from '@/shared/components/AppText/AppText';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { formatCents } from '@/shared/utils/format/formatCents';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

export interface IContributionsSectionProps {
  contributions: IContributionEntry[];
  people: IAllowedEmailListItem[];
  /** Por que não dá para contribuir mais, embaixo do título; sem ele, nada. */
  closedReason?: string;
}

/**
 * As contribuições de um lançamento nos detalhes: o título com o total, o motivo de não aceitar outra e o comprovante
 * de cada uma, com quem, quando e quanto. Aqui o Ver só abre o comprovante; os detalhes dela abrem por Pagamentos.
 */
export function ContributionsSection({ contributions, people, closedReason }: IContributionsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.title}>
        <AppText variant="titleMediumEmphasized" accessibilityRole="header">
          Contribuições
        </AppText>
        <AppText variant="titleMedium" color="onSurfaceVariant">
          {`(${formatCents(sumCents(contributions))})`}
        </AppText>
      </View>
      {closedReason ? (
        <AppText variant="bodySmall" color="onSurfaceVariant">
          {closedReason}
        </AppText>
      ) : null}
      {contributions.map((contribution) => (
        <EntryReceipt
          key={contribution.id}
          entry={contribution}
          icon={HandCoins}
          heading={`${memberNameOf(contribution.paidBy, people)} · ${formatDayMonth(contribution.paidOn)} · ${formatCents(contribution.amountCents)}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.spacing.small },
  title: { flexDirection: 'row', gap: theme.spacing.extraSmallIncreased },
}));
