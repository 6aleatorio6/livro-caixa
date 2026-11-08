import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { IColorRole } from '@/core/types/ColorRole';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { ColorDot } from '@/shared/components/ColorDot/ColorDot';
import { Decorative } from '@/shared/components/Decorative/Decorative';
import { SwitchTrack } from '@/shared/components/SwitchTrack/SwitchTrack';
import type { ITag } from '@/shared/types/tag/Tag';
import { tagColorRole } from '@/shared/utils/tag/tagColorRole';

export interface IListItemProps {
  icon: LucideIcon;
  title: string;
  /** O texto sob o título, em uma linha só: o que passa disso vira reticências. Num interruptor (`isOn`) vai inteiro. */
  support?: string;
  /** A tag de uma conta no Início: a bolinha da cor dela abre o apoio, e o leitor de tela lê o nome depois do título. */
  tag?: ITag;
  /** A cor da marca (o círculo do ícone). */
  markColor?: IColorRole;
  /** A cor do ícone, que combina com a da marca. */
  iconColor?: IColorRole;
  /** O que fica à direita do texto: o valor de uma conta, por exemplo. Com ele o item não mostra a seta. */
  trailing?: ReactNode;
  /**
   * Faz do item um interruptor, ligado ou desligado, com o desenho do interruptor à direita no lugar de `trailing` e da
   * seta. Quem o usa passa o `onPress` que liga e desliga. O leitor de tela o anuncia como interruptor e lê o apoio como
   * dica, e o apoio vai inteiro: num interruptor ele explica o que a opção faz.
   */
  isOn?: boolean;
  /** A medida da linha de conta (64 dp): menos respiro vertical, o título em `titleMedium`. */
  isCompact?: boolean;
  /** Sem `onPress` o item é só leitura: não é um botão e não tem seta. */
  onPress?: () => void;
  /**
   * O rótulo do botão no lugar do título e da tag: para quando a lista repete o título e o rótulo precisa distinguir os
   * itens.
   */
  accessibilityLabel?: string;
}

/** Um item de lista: a marca com o ícone, o título, o apoio e, à direita, o que vem de fora ou, quando leva a outra tela, a seta. */
export function ListItem({
  icon: Icon,
  title,
  support,
  tag,
  markColor = 'secondaryContainer',
  iconColor = 'onSecondaryContainer',
  trailing,
  isOn,
  isCompact = false,
  onPress,
  accessibilityLabel,
}: IListItemProps) {
  const { theme } = useUnistyles();
  const isSwitch = isOn !== undefined;
  const trailingContent = isSwitch ? <SwitchTrack isOn={isOn} /> : trailing;

  const content = (
    <>
      <CircleMark size={40} color={markColor}>
        <Icon size={20} color={theme.colors[iconColor]} />
      </CircleMark>
      <View style={styles.texts}>
        <AppText variant={isCompact ? 'titleMedium' : 'bodyLarge'}>{title}</AppText>
        {support ? (
          <View style={styles.support}>
            {tag ? <ColorDot color={tagColorRole(tag.color)} isSmall /> : null}
            <AppText
              variant="bodySmall"
              color="onSurfaceVariant"
              numberOfLines={isSwitch ? undefined : 1}
              style={styles.supportText}
            >
              {support}
            </AppText>
          </View>
        ) : null}
      </View>
      {trailingContent}
      {onPress && !trailingContent ? (
        <Decorative testID="list-item-chevron">
          <ChevronRight size={24} color={theme.colors.onSurfaceVariant} />
        </Decorative>
      ) : null}
    </>
  );

  if (!onPress) return <View style={styles.row(false, isCompact)}>{content}</View>;
  return (
    <Pressable
      accessibilityRole={isSwitch ? 'switch' : 'button'}
      accessibilityLabel={accessibilityLabel ?? (tag ? `${title}, ${tag.name}` : title)}
      accessibilityHint={isSwitch ? support : undefined}
      accessibilityState={isSwitch ? { checked: isOn } : undefined}
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
  support: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.extraSmallIncreased },
  supportText: { flexShrink: 1 },
}));
