import { doc } from '@react-native-firebase/firestore';

import { allowedEmailId } from '@/shared/services/allowedEmail/allowedEmailId';
import { firestoreDb } from '@/shared/services/firebase/firestoreDb';
import type { IAllowedEmail } from '@/shared/types/allowedEmail/AllowedEmail';
import { createRealtimeService } from '@/shared/utils/serviceUtils/createRealtimeService';

/**
 * A pessoa da lista de e-mails permitidos que entrou (ou `null` se o e-mail não está nela), e a
 * mudança na hora em que o admin a tira ou muda o seu papel. Quem ainda não tem nome vem com `null`.
 */
export const allowedEmailQueryService = createRealtimeService({
  refs: ({ email }: { email: string | null }) =>
    email ? [doc(firestoreDb, 'allowedEmails', allowedEmailId(email))] : [],
  resolve: ([allowedEmail]): IAllowedEmail | null =>
    allowedEmail ? { name: allowedEmail.name ?? null, isAdmin: allowedEmail.isAdmin } : null,
});
