import { doc } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/** O documento único das tags da família, `settings/tags`, com o mapa `items`. */
export function tagsRef() {
  return doc(firestoreDb, 'settings', 'tags');
}
