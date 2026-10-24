import { StyleSheet } from 'react-native-unistyles';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';

// Tela provisória: some quando o login e o Início entrarem.
export default function HomeScreen() {
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
