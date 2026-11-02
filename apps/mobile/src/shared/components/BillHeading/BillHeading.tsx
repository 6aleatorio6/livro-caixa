import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { TagChip } from '@/shared/components/TagChip/TagChip';
import type { ITag } from '@/shared/types/tag/Tag';

export interface IBillHeadingProps {
  /** O que o formulário registra ou altera, e de quando: "Conta de outubro", "Contribuição de novembro". */
  label: string;
  /** O nome da conta. */
  name: string;
  /** A tag da conta, se ela ainda existe; sem ela o chip some. */
  tag?: ITag;
  /** A linha ao lado do chip: o vencimento e o previsto, ou o que falta. */
  details: string;
}

/** O topo dos formulários de pagamento e de contribuição: a conta que eles registram, só para leitura. */
export function BillHeading({ label, name, tag, details }: IBillHeadingProps) {
  return (
    <View style={styles.bill}>
      <AppText variant="labelMedium" color="onSurfaceVariant">
        {label}
      </AppText>
      <AppText variant="headlineSmallEmphasized">{name}</AppText>
      <View style={styles.details}>
        {tag ? <TagChip name={tag.name} color={tag.color} /> : null}
        <AppText variant="bodyMedium" color="onSurfaceVariant">
          {details}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  bill: { gap: theme.spacing.small },
  details: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.medium },
}));
