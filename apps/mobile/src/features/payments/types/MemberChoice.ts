/** Um chip de Pagamentos: uma pessoa, pelo uid dos lançamentos dela, e o rótulo ("Você" para quem está logado). */
export interface IMemberChoice {
  uid: string;
  name: string;
}
