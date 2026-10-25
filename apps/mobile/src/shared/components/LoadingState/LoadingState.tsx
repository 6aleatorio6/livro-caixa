import { ActivityIndicator, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/** O que a tela mostra enquanto a lista ainda não chegou: o indicador de progresso, centralizado. */
export function LoadingState() {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} accessibilityLabel="Carregando" />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { alignItems: 'center', paddingVertical: theme.spacing.extraLarge },
}));
