import { collection } from '@react-native-firebase/firestore';

import { allowedEmailListItemOf } from '@/shared/services/allowedEmail/allowedEmailListItemOf';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IAllowedEmailDocument } from '@/shared/types/allowedEmail/AllowedEmailDocument';
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
    (allowedEmails as IAllowedEmailDocument[])
      .map(allowedEmailListItemOf)
      .sort((first, second) => displayNameOf(first).localeCompare(displayNameOf(second), 'pt-BR')),
});
