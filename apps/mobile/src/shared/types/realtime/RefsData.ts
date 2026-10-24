import type { DocumentReference, Query } from '@react-native-firebase/firestore';

import type { IRealtimeRef } from './RealtimeRef';

/**
 * O que cada ref entrega, na mesma ordem das refs: o documento com o `id` (ou `null`, se não
 * existe) e a consulta como lista de documentos com o `id`.
 */
export type IRefsData<TRefs extends readonly IRealtimeRef[]> = {
  [Index in keyof TRefs]: TRefs[Index] extends DocumentReference<infer TDoc>
    ? (TDoc & { id: string }) | null
    : TRefs[Index] extends Query<infer TDoc>
      ? (TDoc & { id: string })[]
      : never;
};
