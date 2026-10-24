import { doc, getDoc, type DocumentData, type Firestore } from 'firebase/firestore';

import { rulesTestEnvironment } from './rulesTestEnvironment';

/** Lê um documento pelo caminho, como administrador; `null` se não existe. */
export async function readWithoutRules(path: string) {
  const environment = await rulesTestEnvironment;
  let data: DocumentData | null = null;
  await environment.withSecurityRulesDisabled(async (context) => {
    // O `firestore()` do contexto tem o tipo da API antiga, mas aceita as funções modulares.
    const snapshot = await getDoc(doc(context.firestore() as unknown as Firestore, path));
    data = snapshot.exists() ? snapshot.data() : null;
  });
  return data;
}
