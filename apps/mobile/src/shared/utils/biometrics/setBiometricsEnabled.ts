import { useBiometricLockStore } from '@/shared/store/biometricLock.store';

import { writeBiometricsEnabled } from './writeBiometricsEnabled';

/**
 * Liga ou desliga a opção "Entrar com biometria" neste celular. Grava o arquivo antes do store: se a gravação falha, o
 * erro sobe e o store continua igual ao arquivo, o que a próxima abertura vai ler.
 */
export function setBiometricsEnabled(isEnabled: boolean) {
  writeBiometricsEnabled(isEnabled);
  useBiometricLockStore.setState({ isEnabled });
}
