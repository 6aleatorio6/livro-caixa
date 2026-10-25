// O Firestore do emulador como dono do projeto, pela mesma biblioteca do `firebase/firestore.rules.test.mjs`:
// o `withSecurityRulesDisabled` passa por cima das regras, como quem administra pelo console.
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import type { Firestore } from 'firebase/firestore';

/** O que um cenário recebe: o banco, já sem as regras, e como apagá-lo inteiro. */
export type OwnerFirestore = { db: Firestore; deleteAll: () => Promise<void> };

export async function openEmulatorFirestore(projectId: string, port: number) {
  const environment = await initializeTestEnvironment({ projectId, firestore: { host: 'localhost', port } });
  return {
    async asOwner<Result>(write: (owner: OwnerFirestore) => Promise<Result>) {
      let result: Result | undefined;
      await environment.withSecurityRulesDisabled(async (context) => {
        // A biblioteca devolve o tipo do SDK antigo (compat); as funções modulares aceitam o mesmo objeto.
        const db = context.firestore() as unknown as Firestore;
        result = await write({ db, deleteAll: () => environment.clearFirestore() });
      });
      return result as Result;
    },
    close: () => environment.cleanup(),
  };
}
