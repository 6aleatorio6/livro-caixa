import { FingerprintPattern } from 'lucide-react-native';

import { ListItem } from '@/shared/components/ListItem/ListItem';
import { useBiometricLockStore } from '@/shared/store/biometricLock.store';

import { doTurnOffBiometrics } from '@/features/settings/pages/SettingsPage/utils/actions/doTurnOffBiometrics';
import { doTurnOnBiometrics } from '@/features/settings/pages/SettingsPage/utils/actions/doTurnOnBiometrics';

/** A linha "Entrar com biometria" de Configurações: um interruptor que mostra a opção guardada neste celular. */
export function BiometricsRow() {
  const isEnabled = useBiometricLockStore((state) => state.isEnabled);

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
