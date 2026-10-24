import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';

export interface IPersonItemProps {
  name: string;
  email: string | null;
  /** A linha de situação sob o e-mail (o papel, se a pessoa tem lançamentos). */
  situation?: string;
  situationColor?: IColorRole;
  /** A ação no fim da linha, como o Remover. */
  trailing?: ReactNode;
}

/** Uma pessoa da família: o círculo com a inicial, o nome, o e-mail e, se houver, a situação e uma ação. */
export function PersonItem({ name, email, situation, situationColor = 'onSurfaceVariant', trailing }: IPersonItemProps) {
  return (
    <View style={styles.item}>
      <CircleMark size={40} color="secondaryContainer">
        <AppText variant="labelLargeEmphasized" color="onSecondaryContainer">
          {name.charAt(0).toUpperCase()}
        </AppText>
      </CircleMark>
      <View style={styles.texts}>
        <AppText variant="bodyLarge">{name}</AppText>
        <AppText variant="bodySmall" color="onSurfaceVariant">
          {email}
        </AppText>
        {situation ? (
          <AppText variant="labelMedium" color={situationColor}>
            {situation}
          </AppText>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.mediumIncreased,
    paddingVertical: theme.spacing.medium,
  },
  // O design tem 1 dp entre as linhas, sem token: o mais próximo é 2.
  texts: { flex: 1, gap: theme.spacing.extraExtraSmall },
}));
