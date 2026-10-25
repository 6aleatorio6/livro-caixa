import { testAccountUid } from '@/shared/testing/testAccountUid';

import { CONTRACT_EMULATORS } from './contractEmulators';

/**
 * Cria no emulador do Auth a conta de teste com o uid fixo (`testAccountUid`). A entrada com o mesmo
 * e-mail, que vem depois, cai nessa conta em vez de abrir outra com um uid sorteado.
 */
export async function createAuthAccount({ email, name }: { email: string; name: string }) {
  const response = await fetch(
    `${CONTRACT_EMULATORS.authUrl}/identitytoolkit.googleapis.com/v1/projects/${CONTRACT_EMULATORS.projectId}/accounts`,
    {
      method: 'POST',
      // `Bearer owner` é o acesso de administrador do emulador.
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
      body: JSON.stringify({ localId: testAccountUid(email), email, emailVerified: true, displayName: name }),
    },
  );
  if (!response.ok) throw new Error(`Criar a conta de teste no emulador do Auth falhou: ${response.status}`);
}
