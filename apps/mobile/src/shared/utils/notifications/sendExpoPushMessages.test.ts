import type { IExpoPushMessage } from '@/shared/types/notifications/ExpoPushMessage';

import { sendExpoPushMessages } from './sendExpoPushMessages';

const fetchMock = jest.fn();
global.fetch = fetchMock;

function messagesFor(count: number): IExpoPushMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    to: `ExponentPushToken[celular-${index}]`,
    title: 'Título',
    body: 'Texto',
    data: { url: '/entries/x' },
    priority: 'high',
  }));
}

/** Cada pedido recebe um tíquete `ok` por mensagem enviada, com o token no id para dar para ver a ordem. */
function answerWithOneTicketPerMessage() {
  fetchMock.mockImplementation(async (_url: string, init: { body: string }) => ({
    ok: true,
    json: async () => ({
      data: (JSON.parse(init.body) as IExpoPushMessage[]).map(({ to }) => ({ status: 'ok', id: to })),
    }),
  }));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sendExpoPushMessages', () => {
  it('Should post the messages as JSON to the Expo push service', async () => {
    answerWithOneTicketPerMessage();
    const messages = messagesFor(2);

    await sendExpoPushMessages(messages);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
  });

  it('Should send 230 messages in three requests of 100, 100 and 30, and return the tickets in order', async () => {
    answerWithOneTicketPerMessage();
    const messages = messagesFor(230);

    const tickets = await sendExpoPushMessages(messages);

    const sizes = fetchMock.mock.calls.map(([, init]) => (JSON.parse(init.body) as unknown[]).length);
    expect(sizes).toEqual([100, 100, 30]);
    expect(tickets.map((ticket) => ('id' in ticket ? ticket.id : null))).toEqual(messages.map(({ to }) => to));
  });

  it('Should not call the service when there is nothing to send', async () => {
    await expect(sendExpoPushMessages([])).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Should throw when the service answers with an HTTP error', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 });

    await expect(sendExpoPushMessages(messagesFor(1))).rejects.toThrow('503');
  });
});
