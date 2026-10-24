import { ActivityIndicator, Modal, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useLoaderStore } from '@/shared/store/loader.store';

/** O carregamento que cobre a tela e bloqueia o toque. Montado uma vez, pelo `AppContainer`. */
export function FullscreenLoader() {
  const { isVisible } = useLoaderStore();
  const { theme } = useUnistyles();

  return (
    <Modal transparent visible={isVisible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.scrim} />
        <ActivityIndicator size="large" color={theme.colors.primary} accessibilityLabel="Carregando" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.scrim, opacity: 0.32 },
}));
