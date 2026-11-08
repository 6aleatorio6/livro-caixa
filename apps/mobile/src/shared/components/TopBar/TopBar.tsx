import { router } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { IconButton, type IIconButtonProps } from '@/shared/components/IconButton/IconButton';

export interface ITopBarProps {
  title: string;
  /** `close` troca a seta de voltar pelo `x` de fechar, nas telas que cobrem tudo (o comprovante em tela cheia). */
  icon?: 'back' | 'close';
  /** O que o botão faz no lugar de desfazer a última navegação: a tela que limpa algo antes de sair. */
  onBack?: () => void;
  /** O botão de ícone no fim da barra, como o Compartilhar do comprovante. */
  action?: Omit<IIconButtonProps, 'color'>;
}

/**
 * A barra superior de uma tela fora das abas: o voltar (ou o fechar), que desfaz a última navegação, o título numa
 * linha só e, se houver, uma ação.
 */
export function TopBar({ title, icon = 'back', onBack = () => router.back(), action }: ITopBarProps) {
  return (
    <View style={styles.bar(Boolean(action))}>
      <IconButton
        icon={icon === 'close' ? X : ArrowLeft}
        label={icon === 'close' ? 'Fechar' : 'Voltar'}
        color="onSurface"
        onPress={onBack}
      />
      <AppText variant="titleLarge" accessibilityRole="header" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      {action ? <IconButton {...action} color="onSurface" /> : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // Com a ação no fim, a borda direita fica igual à esquerda: o botão de ícone já traz o próprio respiro.
  bar: (hasAction: boolean) => ({
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.extraSmall,
    paddingLeft: theme.spacing.extraSmall,
    paddingRight: hasAction ? theme.spacing.extraSmall : theme.spacing.large,
  }),
  title: { flex: 1 },
}));
