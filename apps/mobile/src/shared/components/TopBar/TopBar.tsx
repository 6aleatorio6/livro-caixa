import { router } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { IconButton } from '@/shared/components/IconButton/IconButton';

export interface ITopBarProps {
  title: string;
  /** `close` troca a seta de voltar pelo `x` de fechar, nas telas que cobrem tudo (o comprovante em tela cheia). */
  icon?: 'back' | 'close';
  /** O que o botão faz no lugar de desfazer a última navegação: a tela que limpa algo antes de sair. */
  onBack?: () => void;
}

/** A barra superior de uma tela fora das abas: o voltar (ou o fechar), que desfaz a última navegação, e o título numa linha só. */
export function TopBar({ title, icon = 'back', onBack = () => router.back() }: ITopBarProps) {
  return (
    <View style={styles.bar}>
      <IconButton
        icon={icon === 'close' ? X : ArrowLeft}
        label={icon === 'close' ? 'Fechar' : 'Voltar'}
        color="onSurface"
        onPress={onBack}
      />
      <AppText variant="titleLarge" accessibilityRole="header" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.extraSmall,
    paddingLeft: theme.spacing.extraSmall,
    paddingRight: theme.spacing.large,
  },
  title: { flex: 1 },
}));
