import { View, type ViewProps } from 'react-native';

/** Esconde do leitor de tela o que é só enfeite, como o ícone ao lado de um texto que já diz o mesmo. */
export function Decorative(props: ViewProps) {
  return <View {...props} accessible={false} importantForAccessibility="no-hide-descendants" />;
}
