import { collection, getDocs, type Firestore } from 'firebase/firestore';

import { rulesTestEnvironment } from './rulesTestEnvironment';

/** Lê os documentos de uma coleção pelo caminho, como administrador, cada um com o `id`. */
export async function readCollectionWithoutRules(path: string) {
  const environment = await rulesTestEnvironment;
  let documents: ({ id: string } & Record<string, unknown>)[] = [];
  await environment.withSecurityRulesDisabled(async (context) => {
    // O `firestore()` do contexto tem o tipo da API antiga, mas aceita as funções modulares.
    const snapshot = await getDocs(collection(context.firestore() as unknown as Firestore, path));
    documents = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
  });
  return documents;
}
