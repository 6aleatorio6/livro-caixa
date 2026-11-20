# Débito Técnico

**O que o código faz de um jeito mais complicado do que precisa, com o custo medido e a saída
escolhida.** Cada item diz quando sai: nenhum entra num branch que já mexe no mesmo lugar por outro
motivo.

## O pagamento sem dono fica entre os lançamentos

Quando a primeira contribuição chega a um mês ainda sem pagamento, nasce em `entries` um pagamento
sem `paidBy`, sem `amountCents` e sem `receiptFileId`. Ele não é dinheiro: só guarda o mês da conta
e as cópias do nome, da tag e do previsto, para as contribuições apontarem para ele. Quando alguém
paga o mês, o mesmo documento ganha o dono.

- **Custo, medido em 20/11/2026:** 29 arquivos do app tratam o caso, fora os testes, com 20
  checagens de "tem dono?" (`isOwnedEntry`, `isUnownedPayment`), uma folha de detalhes própria
  (`UnownedPaymentDetails`) e tipos separados (`OwnedEntry`, `UnownedPaymentEntry`,
  `AuthoredEntry`). As regras têm um validador só para ele e ramos próprios para criar, ganhar dono,
  perder dono e excluir.
- **Saída:** o mês com contribuições vira um documento da coleção `billMonths`, com
  `status: contributed` e as cópias, e as contribuições apontam para ele, que tem o mesmo id do
  pagamento do mês (`2026-11_rent`). Pagar o mês passa a ser criar um pagamento comum, e `entries`
  fica só com dinheiro, como a `billMonths` já fez com o mês pago depois e o mês pulado
  ([Modelo de Dados](04-modelo-de-dados.md)).
- **O que muda para quem usa:** nada.
- **Quando:** num branch próprio, depois do das contas atrasadas, que cria a `billMonths`. O branch
  mede de novo os arquivos, as checagens e as linhas das regras, antes e depois.
