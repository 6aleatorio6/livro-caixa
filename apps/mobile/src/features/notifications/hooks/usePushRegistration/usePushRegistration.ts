import {
  addPushTokenListener,
  type DevicePushToken,
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
 * Android se cadastra ao voltar, e quem a recusou não vê o pedido a cada volta. E, se o FCM troca o token com o app
 * aberto, grava o novo, porque o antigo para de receber. A falha vai só ao log, sem aviso, porque a próxima abertura
 * tenta de novo.
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

      await saveToken((await getExpoPushTokenAsync()).data);
    }

    async function saveToken(token: string) {
      // Guarda antes de gravar: uma saída durante a gravação apaga o documento logo depois dela, porque o Firestore
      // aplica em ordem as escritas do mesmo celular.
      usePushTokenStore.setState({ token });
      await savePushTokenService(token);
    }

    // O `expo-notifications` avisa também a cada busca do token, mesmo sem troca: por isso compara com o guardado. E
    // converte o token recebido, sem buscá-lo de novo, porque a busca avisaria outra vez, em laço.
    async function saveRolledToken(devicePushToken: DevicePushToken) {
      const savedToken = usePushTokenStore.getState().token;
      if (!savedToken) return;
      const { data: token } = await getExpoPushTokenAsync({ devicePushToken });
      if (token !== savedToken) await saveToken(token);
    }

    function logFailure(error: unknown) {
      console.warn('Não deu para cadastrar este celular para as notificações.', error);
    }

    function registerOnce(shouldAskPermission: boolean) {
      if (isRegistering) return;
      isRegistering = true;
      register(shouldAskPermission)
        .catch(logFailure)
        .finally(() => {
          isRegistering = false;
        });
    }

    registerOnce(true);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !usePushTokenStore.getState().token) registerOnce(false);
    });
    const tokenSubscription = addPushTokenListener((devicePushToken) => {
      saveRolledToken(devicePushToken).catch(logFailure);
    });
    return () => {
      subscription.remove();
      tokenSubscription.remove();
    };
  }, []);
}
