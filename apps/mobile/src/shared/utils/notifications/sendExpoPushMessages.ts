import type { IExpoPushMessage } from '@/shared/types/notifications/ExpoPushMessage';
import type { IExpoPushTicket } from '@/shared/types/notifications/ExpoPushTicket';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
/** O máximo de mensagens por pedido que o Expo aceita. */
const MAX_MESSAGES_PER_REQUEST = 100;

/**
 * Envia as mensagens ao serviço de push do Expo, em pedidos de até 100, e devolve os tíquetes na ordem. Uma resposta
 * com erro de HTTP lança; o erro de um token (o tíquete `error`) não, porque o tíquete é o retorno.
 */
export async function sendExpoPushMessages(messages: IExpoPushMessage[]) {
  const tickets: IExpoPushTicket[] = [];
  for (let start = 0; start < messages.length; start += MAX_MESSAGES_PER_REQUEST) {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages.slice(start, start + MAX_MESSAGES_PER_REQUEST)),
    });
    if (!response.ok) throw new Error(`O serviço de push do Expo respondeu ${response.status}`);
    const { data } = (await response.json()) as { data: IExpoPushTicket[] };
    tickets.push(...data);
  }
  return tickets;
}
