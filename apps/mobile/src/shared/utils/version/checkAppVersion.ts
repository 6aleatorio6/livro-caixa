import { APP_VERSION } from '@/shared/constants/appVersion';
import { findMinimumAppVersionService } from '@/shared/services/appSettings/findMinimumAppVersionService';
import { useAppVersionLockStore } from '@/shared/store/appVersionLock.store';
import { resultWithinDeadline } from '@/shared/utils/async/resultWithinDeadline';

import { isVersionBelow } from './isVersionBelow';

const READ_DEADLINE_MS = 3000;

let checkInFlight: Promise<void> | null = null;

/**
 * Lê a versão mínima e grava no store se o app instalado está abaixo dela. Uma leitura que falha ou que não responde
 * em 3 s (sem internet e sem cache, o `getDoc` pode ficar esperando) não barra: a conferência não segura a abertura
 * do app nem tranca quem só está sem rede. Nunca rejeita.
 *
 * Conferências que se sobrepõem (o layout ao abrir e o Início ao ganhar o foco) dividem uma leitura só: com duas em
 * voo, a resposta mais velha, chegando por último, desfaria a mais nova.
 */
export function checkAppVersion(): Promise<void> {
  checkInFlight ??= readAndStoreRequiredVersion().finally(() => {
    checkInFlight = null;
  });
  return checkInFlight;
}

async function readAndStoreRequiredVersion() {
  // Uma leitura que falha vale o mesmo que o prazo vencido: não barra.
  const reading = findMinimumAppVersionService().catch(() => null);
  const minimumVersion = await resultWithinDeadline(reading, READ_DEADLINE_MS);
  const isBelowMinimum = minimumVersion !== null && isVersionBelow(APP_VERSION, minimumVersion);
  useAppVersionLockStore.setState({ requiredVersion: isBelowMinimum ? minimumVersion : null });
}
