import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import type { ITagColor } from '@/shared/types/tag/TagColor';
import { tagColorRoles } from '@/shared/utils/tag/tagColorRoles';

export interface IDetailRowProps {
  label: string;
  value: string;
  /** A cor da tag: só a linha "Tag" a passa, e o valor ganha a bolinha dela à esquerda. */
  tagColor?: ITagColor;
}

/** Uma linha de detalhe: o rótulo à esquerda, o valor à direita e a borda de baixo. */
export function DetailRow({ label, value, tagColor }: IDetailRowProps) {
  return (
    <View style={styles.row}>
      <AppText variant="bodyMedium" color="onSurfaceVariant">
        {label}
      </AppText>
      <View style={styles.value}>
        {tagColor ? <Decorative style={styles.dot(tagColor)} /> : null}
        <AppText variant="bodyLarge" numberOfLines={1} style={styles.text}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.large,
    height: 48, // a altura do design, com a borda de baixo para dentro
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  value: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.small },
  text: { flexShrink: 1 },
  dot: (color: ITagColor) => ({
    width: 10, // a bolinha do design, sem token
    height: 10,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors[tagColorRoles(color).mainRole],
  }),
}));
