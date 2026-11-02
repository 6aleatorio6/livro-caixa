/**
 * Um chip de Pagamentos: "Todos", a família inteira, ou uma pessoa, pelo uid dos lançamentos dela. A `key` identifica o
 * chip ("everyone" ou o uid) e o `name` é o rótulo ("Você" para quem está logado).
 */
export type IMemberChoice =
  | { kind: 'everyone'; key: 'everyone'; name: string }
  | { kind: 'member'; key: string; uid: string; name: string };
