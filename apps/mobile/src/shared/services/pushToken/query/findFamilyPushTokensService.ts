import { collection, getDocs } from '@react-native-firebase/firestore';

import { allowedEmailListItemOf } from '@/shared/services/allowedEmail/allowedEmailListItemOf';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IAllowedEmailDocument } from '@/shared/types/allowedEmail/AllowedEmailDocument';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { snapshotData } from '@/shared/utils/serviceUtils/snapshotData';

/**
 * Os tokens para onde a notificação de quem envia vai, e o primeiro nome dele para o texto. Lê uma vez os tokens e a
 * lista de e-mails permitidos: ficam os tokens que não são do `senderUid` e cujo `uid` ainda está na lista, porque
 * quem saiu dela deixa o token para trás.
 */
export async function findFamilyPushTokensService(senderUid: string) {
  const [pushTokens, allowedEmails] = await Promise.all([
    getDocs(collection(firestoreDb, 'pushTokens')),
    getDocs(collection(firestoreDb, 'allowedEmails')),
  ]);
  const people = (snapshotData(allowedEmails) as IAllowedEmailDocument[]).map(allowedEmailListItemOf);
  const uidsInTheList = new Set(people.map(({ uid }) => uid));

  return {
    senderName: memberNameOf(senderUid, people),
    tokens: pushTokens.docs
      .filter((pushToken) => pushToken.data().uid !== senderUid && uidsInTheList.has(pushToken.data().uid))
      .map((pushToken) => pushToken.id),
  };
}
