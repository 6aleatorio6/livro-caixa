import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Badge, type IBadgeProps } from '@/shared/components/Badge/Badge';
import { TagChip } from '@/shared/components/TagChip/TagChip';
import type { ITag } from '@/shared/types/tag/Tag';

export interface IBillHeadingProps {
  /** O que o formulário registra ou altera, e de quando: "Conta de outubro", "Contribuição de novembro". */
  label: string;
  /** O nome da conta. */
  name: string;
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** O selo ao lado do nome ("Atrasada"); sem ele, só o nome. */
  badge?: IBadgeProps;
  /** A linha ao lado do chip: o vencimento e o previsto, ou o que falta. */
  details: string;
}

/** O topo dos formulários de pagamento e de contribuição: a conta que eles registram, só para leitura. */
export function BillHeading({ label, name, badge, tag, details }: IBillHeadingProps) {
  return (
    <View style={styles.bill}>
      <AppText variant="labelMedium" color="onSurfaceVariant">
        {label}
      </AppText>
      <View style={styles.title}>
        <AppText variant="headlineSmallEmphasized" style={styles.name}>
          {name}
        </AppText>
        {badge ? <Badge {...badge} /> : null}
      </View>
      <View style={styles.details}>
        {tag ? <TagChip name={tag.name} color={tag.color} /> : null}
        <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.detailsText}>
          {details}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  bill: { gap: theme.spacing.small },
  title: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: theme.spacing.smallIncreased },
  name: { flexShrink: 1 },
  // Com a fonte grande do Android, a linha não cabe ao lado do chip: desce para baixo dele e, se nem assim couber,
  // quebra em vez de passar da borda.
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: theme.spacing.medium,
    rowGap: theme.spacing.small,
  },
  detailsText: { flexShrink: 1 },
}));
