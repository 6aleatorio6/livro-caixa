import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';

/** Provisória: some quando a tela entrar. */
export function SettingsPage() {
  return (
    <Screen isAboveNavigationBar>
      <View style={styles.center}>
        <AppText variant="headlineMedium">Configurações</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
