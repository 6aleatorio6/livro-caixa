import { findFamilyPushTokensService } from '@/shared/services/pushToken/query/findFamilyPushTokensService';
import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import type { IExpoPushMessage } from '@/shared/types/notifications/ExpoPushMessage';
import type { INotifiedEntry } from '@/shared/types/notifications/NotifiedEntry';
import { entryNotificationOf } from '@/shared/utils/notifications/entryNotificationOf';
import { notificationChannels } from '@/shared/utils/notifications/notificationChannels';
import { sendExpoPushMessages } from '@/shared/utils/notifications/sendExpoPushMessages';

/**
 * Avisa os outros membros da família de um lançamento que quem está logado acabou de registrar: uma notificação por
 * celular, que o toque abre no lançamento. No pagamento de uma conta do mês vai também, a cada celular, a mensagem
 * silenciosa que cancela o lembrete dela (`cancelReminder`, `{mês}_{conta}`, que é o id do pagamento). Nunca lança: a
 * notificação é um extra, e o lançamento já está gravado; a falha vai só ao log.
 */
export async function notifyFamilyOfEntry(entry: INotifiedEntry) {
  try {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) throw new Error('Não há sessão para avisar a família');

    const { senderName, tokens } = await findFamilyPushTokensService(uid);
    const { title, body, url } = entryNotificationOf(entry, senderName);
    const messages: IExpoPushMessage[] = tokens.map((to) => ({
      to,
      title,
      body,
      data: { url },
      channelId: notificationChannels.entries.id,
      priority: 'high',
    }));
    if (entry.kind === 'recurringPayment') {
      messages.push(
        ...tokens.map((to): IExpoPushMessage => ({ to, data: { cancelReminder: entry.id }, priority: 'high' })),
      );
    }
    await sendExpoPushMessages(messages);
  } catch (error) {
    console.warn('Não deu para avisar a família do lançamento.', error);
  }
}
