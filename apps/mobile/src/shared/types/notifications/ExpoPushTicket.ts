/** O tíquete que o Expo devolve por mensagem aceita: `ok` com o id do recibo, ou `error` com o motivo. */
export type IExpoPushTicket = { status: 'ok'; id: string } | { status: 'error'; message: string };
