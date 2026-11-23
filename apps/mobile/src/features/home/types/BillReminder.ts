/** O lembrete de uma conta que vence no dia seguinte, pronto para o celular agendar. */
export interface IBillReminder {
  /** `AAAA-MM_<conta>`: o id do pagamento da conta no mês, o mesmo que a mensagem `cancelReminder` traz. */
  identifier: string;
  title: string;
  body: string;
  /** A hora em que o lembrete aparece: 9h da véspera do vencimento. */
  date: Date;
}
