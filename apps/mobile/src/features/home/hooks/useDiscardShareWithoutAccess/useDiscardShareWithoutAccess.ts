import { clearSharedPayloads } from 'expo-sharing';
import { useEffect, useRef } from 'react';

import type { IAccessStatus } from '@/shared/types/auth/AccessStatus';

/**
 * No primeiro estado depois do `loading`, sem acesso (`signedOut` ou `denied`), descarta o compartilhamento que
 * chegou com o app fechado, para quem entrar depois não ver o arquivo de outra pessoa. Com acesso não faz nada: quem
 * abre a tela de escolher a conta é o Início (`useOpenPendingShare`).
 */
export function useDiscardShareWithoutAccess(status: IAccessStatus) {
  const hasSettled = useRef(false);

  useEffect(() => {
    if (status === 'loading' || hasSettled.current) return;
    hasSettled.current = true;

    if (status !== 'allowed') clearSharedPayloads();
  }, [status]);
}
