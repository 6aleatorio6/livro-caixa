import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { useBiometricLockStore } from '@/shared/store/biometricLock.store';

import { useIsBiometricsAvailable } from '@/features/settings/pages/SettingsPage/hooks/useIsBiometricsAvailable/useIsBiometricsAvailable';
import { BiometricsRow } from '@/features/settings/pages/SettingsPage/components/BiometricsRow/BiometricsRow';

/**
 * A seção "Neste celular" de Configurações: o que vale só para este aparelho. Some do celular sem biometria cadastrada,
 * a não ser que a opção já esteja ligada: o bloqueio continua pedindo (pelo PIN do aparelho), e quem apagou a biometria
 * precisa poder desligá-la.
 */
export function BiometricsSection() {
  const isAvailable = useIsBiometricsAvailable();
  const isEnabled = useBiometricLockStore((state) => state.isEnabled);
  if (!isAvailable && !isEnabled) return null;

  return (
    <View style={styles.section}>
      <AppText variant="labelMedium" color="onSurfaceVariant">
        Neste celular
      </AppText>
      <BiometricsRow />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.spacing.extraExtraSmall },
}));
