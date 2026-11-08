import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useBiometricLockStore } from '@/shared/store/biometricLock.store';
import { lockApp } from '@/shared/utils/biometrics/lockApp';
import { readBiometricsEnabled } from '@/shared/utils/biometrics/readBiometricsEnabled';
import { shouldLockOnReturn } from '@/shared/utils/biometrics/shouldLockOnReturn';

/**
 * Cuida do bloqueio pela biometria e diz se o app está bloqueado. Na primeira renderização lê a opção do arquivo e,
 * com ela ligada, já começa bloqueado: a leitura é síncrona, então não há quadro em que o app apareça aberto à espera
 * do bloqueio, nem a splash precisa esperar por ele. Depois bloqueia de novo quando o app volta do segundo plano
 * depois de 10 minutos fora. Só o `background` conta como saída: o `inactive` (iOS) é o seletor de apps ou o pedido do
 * sistema, que não tira a pessoa do app.
 */
export function useBiometricLock(): boolean {
  // Antes da leitura do store, que já tem de ver a opção restaurada.
  useState(() => {
    const isEnabled = readBiometricsEnabled();
    useBiometricLockStore.setState({ isEnabled, isLocked: isEnabled });
  });
  const isLocked = useBiometricLockStore((state) => state.isLocked);

  useEffect(() => {
    let backgroundedAtMs: number | null = null;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') backgroundedAtMs = Date.now();
      if (nextState !== 'active') return;

      if (shouldLockOnReturn(useBiometricLockStore.getState().isEnabled, backgroundedAtMs, Date.now())) lockApp();
      // A hora da saída é consumida valha ela ou não: aquela saída já foi julgada. Sem isso, a volta à tela depois do
      // pedido do sistema (que tira o app de `active` e o devolve) julgaria a mesma saída de novo e bloquearia o app
      // logo depois do desbloqueio, em laço.
      backgroundedAtMs = null;
    });
    return () => subscription.remove();
  }, []);

  return isLocked;
}
