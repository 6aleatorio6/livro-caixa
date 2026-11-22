import { doc, getDoc } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/**
 * A versão mínima do app, o `version` de `settings/app`, que só as migrações gravam. Lê uma vez, sem tempo real, e
 * sem login (a regra deixa): a tela de atualização aparece antes da entrada. Devolve `null` quando o documento ou o
 * campo não existe, ou o campo está em branco. O `minVersion` é o campo dos apps anteriores às migrações, e este não o
 * lê. Os espaços em volta saem, se alguém gravar o número à mão.
 */
export async function findMinimumAppVersionService(): Promise<string | null> {
  const snapshot = await getDoc(doc(firestoreDb, 'settings', 'app'));
  const storedVersion = snapshot.data()?.version;
  const minVersion = typeof storedVersion === 'string' ? storedVersion.trim() : '';
  return minVersion === '' ? null : minVersion;
}
