import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/app-text';
import { Screen } from '@/shared/components/screen';

/** Provisória: some quando o Início entrar. */
export function HomePage() {
  return (
    <Screen>
      <View style={styles.center}>
        <AppText variant="headlineMedium">Livro-Caixa</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
