import type { LucideIcon } from 'lucide-react-native';
import { use } from 'react';
import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { AboveNavigationBarContext } from '@/shared/components/Screen/AboveNavigationBarContext';

import { EXTENDED_FAB_HEIGHT } from './extendedFabHeight';

export interface IExtendedFabProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

/**
 * O botão flutuante estendido, com ícone e rótulo, para a ação principal da lista ("Nova tag"). Ele mesmo flutua no
 * canto inferior direito, por cima da lista que rola: a página o renderiza logo depois do `ScreenContent`, dentro do
 * `Screen`, e passa `hasFloatingButton` ao `ScreenContent`, para o fim da lista subir acima dele.
 */
export function ExtendedFab({ icon: Icon, label, onPress }: IExtendedFabProps) {
  const { theme } = useUnistyles();
  const isAboveNavigationBar = use(AboveNavigationBarContext);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => styles.container(pressed, isAboveNavigationBar)}
    >
      <Icon size={24} color={theme.colors.onPrimaryContainer} />
      <AppText variant="labelLarge" color="onPrimaryContainer">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  container: (isPressed: boolean, isAboveNavigationBar: boolean) => ({
    position: 'absolute',
    // O `Screen` recua as barras do sistema com padding, que um filho absoluto não respeita: os recuos entram aqui,
    // somados ao recuo lateral da tela (o do `ScreenContent`) e ao respiro maior acima das barras de baixo.
    right: theme.spacing.largeIncreased + rt.insets.right,
    bottom: theme.spacing.extraLarge + (isAboveNavigationBar ? 0 : rt.insets.bottom),
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.smallIncreased,
    height: EXTENDED_FAB_HEIGHT,
    paddingHorizontal: theme.spacing.largeIncreased,
    borderRadius: theme.radii.large,
    backgroundColor: theme.colors.primaryContainer,
    opacity: isPressed ? theme.opacity.pressed : 1,
    // A sombra do design (y 4, desfoque 10, preto a 18%), sem token; no Android quem a desenha é a elevação.
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  }),
}));
