import { useEffect, useState } from 'react';

import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';

import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import type { IAccessStatus } from '@/shared/types/auth/AccessStatus';
import { accessStatusFor } from '@/features/auth/utils/accessStatusFor';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';

// Sem um acesso decidido (`allowed` ou `denied`), uma leitura que só falha deixaria a pessoa no splash sem saída, e só
// a tela de sem acesso tem o Sair. Depois de uma decisão o erro não tem prazo: a pilha em que a pessoa está não muda.
const UNDECIDED_READ_ERROR_TIMEOUT_MS = 30000;

const LOADING_ACCESS: IAccess = { status: 'loading', isAdmin: false };

/**
 * Em que tela a pessoa cai (login, sem acesso ou o app) e se, dentro do app, ela é a admin. Um erro na leitura do
 * e-mail não decide: a tela em que a pessoa está continua (o splash, se ela não está no app nem na de sem acesso) até a
 * nova tentativa do `useRealtime` responder, em vez de trocar a pilha, e com ela a tela do compartilhamento, pela de
 * sem acesso. Só a leitura que erra por 30 s seguidos, sem um acesso decidido (a da abertura ou a de quem entra de
 * novo), leva à tela de sem acesso.
 */
export function useAccess(): IAccess {
  const authState = useAuthState();
  const allowedEmail = useRealtime(allowedEmailQueryService, { email: signedInEmail(authState) });
  const status = accessStatusFor(authState, allowedEmail);
  const isAdmin = status === 'allowed' && allowedEmail.data?.isAdmin === true;

  // O último acesso decidido, com o `isAdmin` junto (no erro, o dado da leitura é `null`), guardado como o React
  // ensina para o que vem da renderização anterior: um `ref` não se lê na renderização.
  const [lastDecided, setLastDecided] = useState<IAccess>(LOADING_ACCESS);
  if (status !== null && (status !== lastDecided.status || isAdmin !== lastDecided.isAdmin)) {
    setLastDecided({ status, isAdmin });
  }

  // Só `allowed` e `denied` sobrevivem a um erro. Quem sai e entra de novo com o mesmo e-mail recebe o erro de antes do
  // `useRealtime` até a nova escuta responder, com `signedOut` como última decisão: isso é esperar a leitura.
  const hasDecidedAccess = lastDecided.status === 'allowed' || lastDecided.status === 'denied';
  const isFailingWithoutDecision = status === null && !hasDecidedAccess;
  useEffect(() => {
    if (!isFailingWithoutDecision) return;
    const timer = setTimeout(
      () => setLastDecided({ status: 'denied', isAdmin: false }),
      UNDECIDED_READ_ERROR_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [isFailingWithoutDecision]);

  return isFailingWithoutDecision ? LOADING_ACCESS : lastDecided;
}

interface IAccess {
  status: IAccessStatus;
  isAdmin: boolean;
}
