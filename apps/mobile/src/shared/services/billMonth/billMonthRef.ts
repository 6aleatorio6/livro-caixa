import { doc } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';

/**
 * O documento de `billMonths` do mês de uma conta recorrente. O id é o mês da conta e a conta (`{mês}_{conta}`), o mesmo
 * id que o pagamento desse mês tem em `entries`.
 */
export function billMonthRef(month: string, recurringBillId: string) {
  return doc(firestoreDb, 'billMonths', `${month}_${recurringBillId}`);
}
