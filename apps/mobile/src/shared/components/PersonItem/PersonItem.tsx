import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { displayNameOf } from '@/shared/utils/person/displayNameOf';

export interface IPersonItemProps {
  /** `null` enquanto a pessoa não entrou: a linha do nome mostra o e-mail, e a do e-mail some. */
  name: string | null;
  email: string;
  /** A linha de situação sob o e-mail (o papel, se a pessoa tem lançamentos). */
  situation?: string;
  situationColor?: IColorRole;
  /** A ação no fim da linha, como o Remover. */
  trailing?: ReactNode;
}

/**
 * Uma pessoa da família: o círculo com a inicial, o nome (de quem ainda não tem, o e-mail) e, sob ele, o e-mail
 * de quem tem nome; se houver, a situação e uma ação.
 */
export function PersonItem({
  name,
  email,
  situation,
  situationColor = 'onSurfaceVariant',
  trailing,
}: IPersonItemProps) {
  const displayName = displayNameOf({ name, email });

  return (
    <View style={styles.item}>
      <CircleMark size={40} color="secondaryContainer">
        <AppText variant="labelLargeEmphasized" color="onSecondaryContainer">
          {displayName.charAt(0).toUpperCase()}
        </AppText>
      </CircleMark>
      <View style={styles.texts}>
        <AppText variant="bodyLarge">{displayName}</AppText>
        {name !== null ? (
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {email}
          </AppText>
        ) : null}
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
