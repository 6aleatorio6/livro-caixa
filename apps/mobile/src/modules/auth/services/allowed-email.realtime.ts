import { doc } from '@react-native-firebase/firestore';

import { firestoreDb } from '@/shared/services/firebase/firestore-db';
import { createRealtimeService } from '@/shared/services/realtime/create-realtime-service';

/** Se o e-mail está na lista de e-mails permitidos, e a mudança na hora em que o admin o tira. */
export const allowedEmailRealtime = createRealtimeService({
  refs: ({ emailId }: { emailId: string | null }) => (emailId ? [doc(firestoreDb, 'allowedEmails', emailId)] : []),
  resolve: ([allowedEmail]) => allowedEmail !== null,
});
