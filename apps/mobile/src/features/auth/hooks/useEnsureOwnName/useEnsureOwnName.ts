import { useEffect, useRef } from 'react';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { changeOwnNameService } from '@/shared/services/allowedEmail/changeOwnName/changeOwnNameService';
import { initialNameOf } from '@/shared/utils/auth/initialNameOf';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';

/**
 * Na primeira entrada, grava o nome da conta Google e o `uid` do login de quem o admin adicionou só pelo
 * e-mail. Espera
 * a resposta do servidor (`success`), porque um nome ausente no cache do aparelho pode estar só
 * atrasado. Sem aviso nem carregamento: a falha vai só ao log, e a próxima abertura tenta de novo.
 */
export function useEnsureOwnName() {
  const authState = useAuthState();
  const email = signedInEmail(authState);
  const { status, data: person } = useRealtime(allowedEmailQueryService, { email });
  const user = authState.status === 'signedIn' ? authState.user : null;
  const hasTried = useRef(false);

  const shouldWriteName = status === 'success' && person !== null && person.name === null;

  useEffect(() => {
    if (!shouldWriteName || !email || !user || hasTried.current) return;
    hasTried.current = true;
    changeOwnNameService({ email, name: initialNameOf(user), uid: user.uid }).catch((error: unknown) =>
      console.warn('Não deu para gravar o nome da conta Google.', error),
    );
  }, [shouldWriteName, email, user]);
}
