import { FingerprintPattern } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { CircleMark } from '@/shared/components/CircleMark/CircleMark';
import { SwitchTrack } from '@/shared/components/SwitchTrack/SwitchTrack';
import { useBiometricLockStore } from '@/shared/store/biometricLock.store';

import { doTurnOffBiometrics } from '@/features/settings/pages/SettingsPage/utils/actions/doTurnOffBiometrics';
import { doTurnOnBiometrics } from '@/features/settings/pages/SettingsPage/utils/actions/doTurnOnBiometrics';

const SUPPORT = 'Pede a digital ou o rosto ao abrir o app e depois de 10 minutos fora';

/** A linha "Entrar com biometria" de Configurações: a marca, o texto e o interruptor, que mostra a opção guardada neste celular. */
export function BiometricsRow() {
  const { theme } = useUnistyles();
  const isEnabled = useBiometricLockStore((state) => state.isEnabled);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Entrar com biometria"
      accessibilityHint={SUPPORT}
      accessibilityState={{ checked: isEnabled }}
      onPress={() => (isEnabled ? doTurnOffBiometrics() : doTurnOnBiometrics())}
      style={({ pressed }) => styles.row(pressed)}
    >
      <CircleMark size={40} color="secondaryContainer">
        <FingerprintPattern size={20} color={theme.colors.onSecondaryContainer} />
      </CircleMark>
      <View style={styles.texts}>
        <AppText variant="bodyLarge">Entrar com biometria</AppText>
        <AppText variant="bodySmall" color="onSurfaceVariant">
          {SUPPORT}
        </AppText>
      </View>
      <SwitchTrack isOn={isEnabled} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: (isPressed: boolean) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.large,
    paddingVertical: theme.spacing.mediumIncreased,
    opacity: isPressed ? theme.opacity.pressed : 1,
  }),
  texts: { flex: 1, gap: theme.spacing.extraExtraSmall },
}));
