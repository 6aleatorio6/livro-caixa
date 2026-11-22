import { FingerprintPattern } from 'lucide-react-native';

import { ListItem } from '@/shared/components/ListItem/ListItem';
import { useBiometricLockStore } from '@/shared/store/biometricLock.store';

import { useIsBiometricsAvailable } from '@/features/settings/pages/SettingsPage/hooks/useIsBiometricsAvailable/useIsBiometricsAvailable';
import { doTurnOffBiometrics } from '@/features/settings/pages/SettingsPage/utils/actions/doTurnOffBiometrics';
import { doTurnOnBiometrics } from '@/features/settings/pages/SettingsPage/utils/actions/doTurnOnBiometrics';

/**
 * A linha "Entrar com biometria" de Configurações: um interruptor que mostra a opção guardada neste celular. Some do
 * celular sem biometria cadastrada, a não ser que a opção já esteja ligada: o bloqueio continua pedindo (pelo PIN do
 * aparelho), e quem apagou a biometria precisa poder desligá-la.
 */
export function BiometricsRow() {
  const isAvailable = useIsBiometricsAvailable();
  const isEnabled = useBiometricLockStore((state) => state.isEnabled);

  if (!isAvailable && !isEnabled) return null;

  return (
    <ListItem
      icon={FingerprintPattern}
      title="Entrar com biometria"
      support="Pede a digital ou o rosto ao abrir o app e depois de 10 minutos fora"
      isOn={isEnabled}
      onPress={() => (isEnabled ? doTurnOffBiometrics() : doTurnOnBiometrics())}
    />
  );
}
