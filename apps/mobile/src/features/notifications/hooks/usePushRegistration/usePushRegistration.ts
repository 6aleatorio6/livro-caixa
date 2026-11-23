import {
  getExpoPushTokenAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
} from 'expo-notifications';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { savePushTokenService } from '@/shared/services/pushToken/save/savePushTokenService';
import { usePushTokenStore } from '@/shared/store/pushToken.store';
import { notificationChannels } from '@/shared/utils/notifications/notificationChannels';

/**
 * Cadastra este celular para receber notificações: cria os canais do Android, pede a permissão quando ela não está dada
 * e, com ela dada, guarda o token do Expo na memória (`usePushTokenStore`), para a saída apagá-lo, e o grava. Os canais
 * vêm antes da permissão e do token, porque o Android 13 só mostra o pedido de permissão depois que o app tem um canal.
 *
 * Pede na montagem. Depois, a cada volta do app para a frente sem token, só lê a permissão: quem a ligou nos ajustes do
 * Android se cadastra ao voltar, e quem a recusou não vê o pedido a cada volta. A falha vai só ao log, sem aviso, porque
 * a próxima abertura tenta de novo.
 */
export function usePushRegistration() {
  useEffect(() => {
    // O próprio pedido de permissão tira o app da frente e o devolve: sem a trava, a volta cadastraria duas vezes.
    let isRegistering = false;

    async function register(shouldAskPermission: boolean) {
      await Promise.all(
        Object.values(notificationChannels).map(({ id, name, importance }) =>
          setNotificationChannelAsync(id, { name, importance }),
        ),
      );
      let { status } = await getPermissionsAsync();
      // No Android 13+, o `expo-notifications` lê a permissão nunca pedida como `denied`, e não `undetermined`: por
      // isso pede sempre que ela não está dada. O Android mostra o pedido no máximo duas vezes; depois responde
      // `denied` sem mostrar nada.
      if (status !== 'granted' && shouldAskPermission) ({ status } = await requestPermissionsAsync());
      if (status !== 'granted') return;

      const token = await getExpoPushTokenAsync();
      // Guarda antes de gravar: uma saída durante a gravação apaga o documento logo depois dela, porque o Firestore
      // aplica em ordem as escritas do mesmo celular.
      usePushTokenStore.setState({ token: token.data });
      await savePushTokenService(token.data);
    }

    function registerOnce(shouldAskPermission: boolean) {
      if (isRegistering) return;
      isRegistering = true;
      register(shouldAskPermission)
        .catch((error: unknown) => console.warn('Não deu para cadastrar este celular para as notificações.', error))
        .finally(() => {
          isRegistering = false;
        });
    }

    registerOnce(true);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !usePushTokenStore.getState().token) registerOnce(false);
    });
    return () => subscription.remove();
  }, []);
}
