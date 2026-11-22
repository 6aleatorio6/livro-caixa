import {
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
} from 'expo-notifications';
import { useEffect } from 'react';

import { savePushTokenService } from '@/shared/services/pushToken/save/savePushTokenService';
import { usePushTokenStore } from '@/shared/store/pushToken.store';
import { notificationChannels } from '@/shared/utils/notifications/notificationChannels';

/**
 * Cadastra este celular para receber notificações: cria os canais do Android, pede a permissão na primeira vez e, com
 * ela dada, guarda o token do Expo na memória (`usePushTokenStore`), para a saída apagá-lo, e o grava. Os canais vêm
 * antes da permissão e do token, porque o Android 13 só mostra o pedido de permissão depois que o app tem um canal.
 * Uma vez por montagem; quem negou não é perguntado de novo, e a falha vai só ao log, sem aviso, porque a próxima
 * abertura tenta de novo.
 */
export function usePushRegistration() {
  useEffect(() => {
    async function register() {
      await Promise.all(
        Object.values(notificationChannels).map(({ id, name, importance }) =>
          setNotificationChannelAsync(id, { name, importance }),
        ),
      );
      let { status } = await getPermissionsAsync();
      if (status === 'undetermined') ({ status } = await requestPermissionsAsync());
      if (status !== 'granted') return;

      const token = await getExpoPushTokenAsync();
      // Guarda antes de gravar: uma saída durante a gravação apaga o documento logo depois dela, porque o Firestore
      // aplica em ordem as escritas do mesmo celular.
      usePushTokenStore.setState({ token: token.data });
      await savePushTokenService(token.data);
    }

    register().catch((error: unknown) =>
      console.warn('Não deu para cadastrar este celular para as notificações.', error),
    );
  }, []);
}
