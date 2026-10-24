import { onSnapshot, type Unsubscribe } from '@react-native-firebase/firestore';

import type { IRealtimeRef } from '@/shared/types/realtime/RealtimeRef';
import type { IRefsData } from '@/shared/types/realtime/RefsData';
import { snapshotData } from './snapshotData';

/**
 * Escuta várias refs juntas e só entrega quando todas já responderam uma vez: a tela nunca vê um
 * mês com as contas e sem os pagamentos. Depois disso, entrega a cada mudança de qualquer uma.
 */
export function subscribeToRefs<TRefs extends readonly IRealtimeRef[]>(
  refs: TRefs,
  onData: (data: IRefsData<TRefs>, isFromCache: boolean) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const dataByIndex: unknown[] = new Array(refs.length);
  const isFromCacheByIndex: boolean[] = new Array(refs.length).fill(false);
  const hasArrivedByIndex: boolean[] = new Array(refs.length).fill(false);

  const unsubscribes = refs.map((ref, index) =>
    onSnapshot(
      // A união de documento e consulta não escolhe uma sobrecarga, e as duas têm a mesma forma.
      ref as never,
      { includeMetadataChanges: true },
      (snapshot: Parameters<typeof snapshotData>[0]) => {
        dataByIndex[index] = snapshotData(snapshot);
        isFromCacheByIndex[index] = snapshot.metadata.fromCache;
        hasArrivedByIndex[index] = true;
        if (hasArrivedByIndex.every(Boolean)) {
          onData([...dataByIndex] as IRefsData<TRefs>, isFromCacheByIndex.some(Boolean));
        }
      },
      onError,
    ),
  );

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}
