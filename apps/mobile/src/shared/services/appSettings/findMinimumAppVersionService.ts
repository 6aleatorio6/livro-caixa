import { doc, getDoc } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/**
 * A versão mínima do app, de `settings/app`. Lê uma vez, sem tempo real, e sem login (a regra deixa): a tela de
 * atualização aparece antes da entrada. Devolve `null` quando o documento ou o campo não existe, ou o campo está
 * em branco. Os espaços em volta saem: quem cola o número no console pode deixá-los, e a trava vale do mesmo jeito.
 */
export async function findMinimumAppVersionService(): Promise<string | null> {
  const snapshot = await getDoc(doc(firestoreDb, 'settings', 'app'));
  const storedVersion = snapshot.data()?.minVersion;
  const minVersion = typeof storedVersion === 'string' ? storedVersion.trim() : '';
  return minVersion === '' ? null : minVersion;
}
