import { collection } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/** A lista inteira de e-mails permitidos, em ordem de nome, para o admin; muda na hora em que alguém entra ou sai. */
export const allowedEmailListQueryService = createRealtimeService({
  refs: () => [collection(firestoreDb, 'allowedEmails')],
  resolve: ([allowedEmails]): IAllowedEmailListItem[] =>
    allowedEmails
      .map(({ id, name, isAdmin, hasEntries }) => ({ email: id, name, isAdmin, hasEntries }))
      .sort((first, second) => (first.name ?? '').localeCompare(second.name ?? '', 'pt-BR')),
});
