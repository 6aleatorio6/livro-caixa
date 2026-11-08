import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ContributionItem } from '@/features/entries/components/ContributionItem/ContributionItem';
import { AppText } from '@/shared/components/AppText/AppText';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { formatCents } from '@/shared/utils/format/formatCents';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';

export interface IContributionsSectionProps {
  contributions: IContributionEntry[];
  people: IAllowedEmailListItem[];
  /** Por que não dá para contribuir mais, embaixo do título; sem ele, nada. */
  closedReason?: string;
}

/** As contribuições de um lançamento nos detalhes: o título com o total, o motivo de não aceitar outra e cada uma. */
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
      <View>
        {contributions.map((contribution) => (
          <ContributionItem
            key={contribution.id}
            contribution={contribution}
            contributorName={memberNameOf(contribution.paidBy, people)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.spacing.small },
  title: { flexDirection: 'row', gap: theme.spacing.extraSmallIncreased },
}));
