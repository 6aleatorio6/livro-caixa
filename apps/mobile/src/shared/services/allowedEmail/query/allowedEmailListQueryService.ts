import { collection } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { displayNameOf } from '@/shared/utils/person/displayNameOf';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * A lista inteira de e-mails permitidos, em ordem de nome (quem ainda não tem nome, pelo e-mail); muda
 * na hora em que alguém entra ou sai. As regras deixam todo membro lê-la, e hoje só o admin a mostra.
 */
export const allowedEmailListQueryService = createRealtimeService({
  refs: () => [collection(firestoreDb, 'allowedEmails')],
  resolve: ([allowedEmails]): IAllowedEmailListItem[] =>
    allowedEmails
      .map(({ id, name, uid, isAdmin, hasEntries }) => ({
        email: id,
        name: name ?? null,
        uid: uid ?? null,
        isAdmin,
        hasEntries,
      }))
      .sort((first, second) => displayNameOf(first).localeCompare(displayNameOf(second), 'pt-BR')),
});
