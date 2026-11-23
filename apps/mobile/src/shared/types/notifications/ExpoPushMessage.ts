/** Uma mensagem para o serviço de push do Expo, só com os campos que o app usa. */
export interface IExpoPushMessage {
  /** O token do Expo do celular que recebe. */
  to: string;
  /** Sem título nem texto, a mensagem não aparece: só entrega o `data` ao app. */
  title?: string;
  body?: string;
  data: Record<string, string>;
  channelId?: string;
  priority: 'high';
}
