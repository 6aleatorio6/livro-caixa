import { router } from 'expo-router';
import { getSharedPayloads } from 'expo-sharing';
import { useEffect } from 'react';

/**
 * Com o app fechado, o compartilhamento chega antes de a sessão carregar. O Início só monta depois que a guarda
 * `allowed` entrou no navegador, então abrir a tela de escolher a conta daqui não disputa com a guarda: um empurrão
 * feito antes dela se perdia. Sem acesso, quem descarta o arquivo é `useDiscardShareWithoutAccess`.
 */
export function useOpenPendingShare() {
  useEffect(() => {
    if (getSharedPayloads().length > 0) router.push('/share-receipt');
  }, []);
}
