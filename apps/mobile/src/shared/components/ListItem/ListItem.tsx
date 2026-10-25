import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { Decorative } from '@/shared/components/Decorative/Decorative';

export interface IListItemProps {
  icon: LucideIcon;
  title: string;
  /** O texto sob o título, em uma linha só: o que passa disso vira reticências. */
  support?: string;
  /** A cor da marca (o círculo do ícone). */
  markColor?: IColorRole;
  /** A cor do ícone, que combina com a da marca. */
  iconColor?: IColorRole;
  /** O que fica à direita do texto: o valor de uma conta, por exemplo. Com ele o item não mostra a seta. */
  trailing?: ReactNode;
  /** A medida da linha de conta (64 dp): menos respiro vertical, o título em `titleMedium`. */
  isCompact?: boolean;
  /** Sem `onPress` o item é só leitura: não é um botão e não tem seta. */
  onPress?: () => void;
}

/** Um item de lista: a marca com o ícone, o título, o apoio e, à direita, o que vem de fora ou, quando leva a outra tela, a seta. */
export function ListItem({
  icon: Icon,
  title,
  support,
  markColor = 'secondaryContainer',
  iconColor = 'onSecondaryContainer',
  trailing,
  isCompact = false,
  onPress,
}: IListItemProps) {
  const { theme } = useUnistyles();

  const content = (
    <>
      <CircleMark size={40} color={markColor}>
        <Icon size={20} color={theme.colors[iconColor]} />
      </CircleMark>
      <View style={styles.texts}>
        <AppText variant={isCompact ? 'titleMedium' : 'bodyLarge'}>{title}</AppText>
        {support ? (
          <AppText variant="bodySmall" color="onSurfaceVariant" numberOfLines={1}>
            {support}
          </AppText>
        ) : null}
      </View>
      {trailing}
      {onPress && !trailing ? (
        <Decorative testID="list-item-chevron">
          <ChevronRight size={24} color={theme.colors.onSurfaceVariant} />
        </Decorative>
      ) : null}
    </>
  );

  if (!onPress) return <View style={styles.row(false, isCompact)}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => styles.row(pressed, isCompact)}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: (isPressed: boolean, isCompact: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: isCompact ? theme.spacing.mediumIncreased : theme.spacing.large,
    paddingVertical: isCompact ? theme.spacing.smallIncreased : theme.spacing.mediumIncreased,
    opacity: isPressed ? theme.opacity.pressed : 1,
  }),
  texts: { flex: 1, gap: theme.spacing.extraExtraSmall },
}));
