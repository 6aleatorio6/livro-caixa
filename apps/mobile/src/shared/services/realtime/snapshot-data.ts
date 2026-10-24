import type { DocumentSnapshot, QuerySnapshot } from '@react-native-firebase/firestore';

/** Os dados de um snapshot, cada documento com o próprio `id`. */
export function snapshotData(snapshot: DocumentSnapshot | QuerySnapshot) {
  if ('docs' in snapshot) return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
