// O Firestore do emulador como dono do projeto, pela mesma biblioteca do `firebase/rules-tests/`:
// o `withSecurityRulesDisabled` passa por cima das regras, como quem administra pelo console.
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import type { Firestore } from 'firebase/firestore';

// O `clearData` do emulador avisa cada escuta de que ela saiu do ar. Se o cliente fechou a chamada na mesma
// hora (o app derruba a conexão ao primeiro erro de uma escuta, e a tela de tags tem três), o aviso seguinte
// vai para uma chamada cancelada, e o emulador responde 500 com o código 499, "call already cancelled",
// embora o app não faça parte do pedido. Apagar de novo não custa nada: o que a primeira vez apagou fica
// apagado, e a escuta fechada já não está na lista. O aviso evita que a repetição passe em silêncio.
const CLEAR_ATTEMPTS = 3;

async function clearWithRetry(clear: () => Promise<void>, warn: (message: string) => void) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await clear();
    } catch (error) {
      const isCancelledCall = String(error).includes('call already cancelled');
      if (!isCancelledCall || attempt === CLEAR_ATTEMPTS) throw error;
      warn(
        `O emulador falhou ao apagar o Firestore (escuta já cancelada); tentativa ${attempt + 1} de ${CLEAR_ATTEMPTS}.`,
      );
    }
  }
}

/** O que um cenário recebe: o banco, já sem as regras, e como apagá-lo inteiro. */
export type OwnerFirestore = { db: Firestore; deleteAll: () => Promise<void> };

/** `warn` recebe os avisos do banco (hoje, o apagar repetido): o `test.ts` os junta no resumo da rodada. */
export async function openEmulatorFirestore(projectId: string, port: number, warn: (message: string) => void) {
  const environment = await initializeTestEnvironment({
    projectId,
    firestore: { host: 'localhost', port },
  });
  return {
    async asOwner<Result>(write: (owner: OwnerFirestore) => Promise<Result>) {
      let result: Result | undefined;
      await environment.withSecurityRulesDisabled(async (context) => {
        // A biblioteca devolve o tipo do SDK antigo (compat); as funções modulares aceitam o mesmo objeto.
        const db = context.firestore() as unknown as Firestore;
        result = await write({
          db,
          deleteAll: () => clearWithRetry(() => environment.clearFirestore(), warn),
        });
      });
      return result as Result;
    },
    close: () => environment.cleanup(),
  };
}
