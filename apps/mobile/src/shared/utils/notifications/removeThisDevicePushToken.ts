import { getExpoPushTokenAsync, getPermissionsAsync } from 'expo-notifications';

import { deletePushTokenService } from '@/shared/services/pushToken/remove/deletePushTokenService';
import { usePushTokenStore } from '@/shared/store/pushToken.store';
import { resultWithinDeadline } from '@/shared/utils/async/resultWithinDeadline';

/** Quanto a saída espera por cada passo da rede antes de seguir sem ele. */
const SIGN_OUT_DEADLINE_MS = 3000;

/** O token do Expo deste celular, pedido de novo; sem a permissão, não há token. */
async function askThisDeviceToken() {
  const { status } = await getPermissionsAsync();
  if (status !== 'granted') return null;
  return (await getExpoPushTokenAsync()).data;
}

/**
 * Apaga o token deste celular de quem está saindo, para a conta que saiu não receber mais o que ele recebia. Usa o
 * token que o cadastro guardou na memória; sem ele (o cadastro desta abertura falhou), pede de novo ao Expo. Cada passo
 * pela rede espera no máximo 3 s: sem internet, a exclusão do Firestore só terminaria quando a rede voltasse, e a pessoa
 * tem de sair na hora. A falha e o prazo vencido vão só ao log; nesses casos o token fica no banco, com o `uid` de quem
 * saiu, até outra pessoa entrar neste celular.
 */
export async function removeThisDevicePushToken() {
  try {
    // O `null` de quem não deu a permissão não é falha; o do prazo vencido é, e vai ao log.
    let hasMissedDeadline = false;
    const token =
      usePushTokenStore.getState().token ??
      (await resultWithinDeadline(askThisDeviceToken(), SIGN_OUT_DEADLINE_MS, () => {
        hasMissedDeadline = true;
      }));
    if (hasMissedDeadline) throw new Error('O pedido do token ao Expo não terminou no prazo');
    if (!token) return;

    const deleted = await resultWithinDeadline(
      deletePushTokenService(token).then(() => true),
      SIGN_OUT_DEADLINE_MS,
    );
    if (!deleted) throw new Error('A exclusão do token não terminou no prazo');
    usePushTokenStore.setState({ token: null });
  } catch (error) {
    console.warn('Não deu para apagar o token de notificação deste celular.', error);
  }
}
