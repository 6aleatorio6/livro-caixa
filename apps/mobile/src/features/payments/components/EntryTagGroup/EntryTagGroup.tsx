import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IEntryTagGroupProps {
  /** O nome da tag, ou "Sem tag". */
  name: string;
  /** A cor da bolinha: a da tag, ou `outline` no grupo sem tag. */
  color: IColorRole;
  /** A soma dos lançamentos do grupo, em centavos. */
  totalCents: number;
  children: ReactNode;
}

/** Um grupo da lista de Pagamentos: a bolinha da cor, o nome e o total da tag, e abaixo as linhas dos lançamentos. */
export function EntryTagGroup({ name, color, totalCents, children }: IEntryTagGroupProps) {
  return (
    <View style={styles.group}>
      <View style={styles.header}>
        <View style={styles.tag}>
          <Decorative style={styles.dot(color)} />
          <AppText variant="labelLarge" color="onSurfaceVariant" accessibilityRole="header">
            {name}
          </AppText>
        </View>
        <AppText variant="labelLarge" color="onSurfaceVariant">
          {formatCents(totalCents)}
        </AppText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  group: { gap: theme.spacing.extraExtraSmall },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.extraSmall,
  },
  tag: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.small },
  dot: (color: IColorRole) => ({
    width: 10, // a bolinha do design, sem token
    height: 10,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors[color],
  }),
}));
