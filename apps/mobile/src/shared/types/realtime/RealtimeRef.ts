import type { DocumentReference, Query } from '@react-native-firebase/firestore';

/** O que uma leitura em tempo real escuta: um documento ou uma consulta. */
export type IRealtimeRef = DocumentReference | Query;
