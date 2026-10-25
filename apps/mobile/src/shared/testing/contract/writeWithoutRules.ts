import { deleteDoc, doc, setDoc, type Firestore } from 'firebase/firestore';

import { rulesTestEnvironment } from './rulesTestEnvironment';

/** Grava cada documento pelo caminho, como administrador; `null` apaga o documento. */
export async function writeWithoutRules(documents: Record<string, object | null>) {
  const environment = await rulesTestEnvironment;
  await environment.withSecurityRulesDisabled(async (context) => {
    // O `firestore()` do contexto tem o tipo da API antiga, mas aceita as funções modulares.
    const firestore = context.firestore() as unknown as Firestore;
    await Promise.all(
      Object.entries(documents).map(([path, data]) =>
        data ? setDoc(doc(firestore, path), data) : deleteDoc(doc(firestore, path)),
      ),
    );
  });
}
