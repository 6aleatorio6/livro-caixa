import { clearLastNotificationResponse, useLastNotificationResponse } from 'expo-notifications';
import { router, useSegments, type Href } from 'expo-router';
import { useEffect } from 'react';

import type { IAccessStatus } from '@/shared/types/auth/AccessStatus';

/** As telas de fora do app liberado: enquanto uma delas está na frente, a troca das guardas ainda vai acontecer. */
const SCREENS_BEFORE_THE_APP = new Set(['sign-in', 'test-sign-in', 'no-access', 'update-required']);

/**
 * Abre a tela que a notificação tocada traz em `data.url`. Só com o acesso liberado: antes disso (a sessão ainda
 * carrega, a pessoa nem entrou, ou o app pede atualização e o status chega `null`) o toque espera, porque a tela de um
 * lançamento está atrás da guarda e o app abriria em outra tela. Espera também as telas do app tomarem o lugar da
 * entrada: com o app fechado, o acesso vira liberado com a entrada ainda na frente, e a troca das guardas, logo depois,
 * abre o Início e descarta a tela aberta antes dela. Depois de abrir, esquece o toque, para ele não abrir de novo.
 * Mensagem sem `url` é ignorada.
 */
export function useOpenTappedNotification(accessStatus: IAccessStatus | null) {
  const response = useLastNotificationResponse();
  const [firstSegment] = useSegments();
  const isAppShown = !SCREENS_BEFORE_THE_APP.has(firstSegment ?? '');

  useEffect(() => {
    const url = response?.notification.request.content.data?.url;
    if (accessStatus !== 'allowed' || !isAppShown || typeof url !== 'string') return;

    router.push(url as Href);
    clearLastNotificationResponse();
  }, [accessStatus, isAppShown, response]);
}
