# Meus Pagamentos

Os lançamentos do membro logado: os [pagamentos de contas recorrentes](03-pagamento-de-conta-recorrente.md)
e as [contas avulsas](04-conta-avulsa.md) que ele registrou. É a aba do meio do app, e é daqui que
o membro altera ou exclui o que registrou. Tudo na lista é um pagamento: a conta avulsa não tem
valor previsto e só é registrada já paga, junto com o comprovante.

## Quem usa e quando

Todo membro, para conferir o que ele mesmo pagou ou para corrigir um lançamento.

## O que aparece na tela

- **A lista dos lançamentos do membro no mês**, do mais recente para o mais antigo: o nome da
  conta, a data, o valor, a tag e se é um pagamento ou uma conta avulsa.
- **O total que o membro pagou no mês.**
- **A troca de mês**, como no [Início](01-inicio.md).
- **O botão Nova conta avulsa**, que abre o registro de uma [conta avulsa](04-conta-avulsa.md).

Ao tocar num lançamento, abrem os [detalhes](07-detalhes-do-lancamento.md) dele, com o comprovante,
Alterar e Excluir.

## Regras

- A lista mostra só os lançamentos de quem está logado. Os dos outros membros aparecem no Início.
- Cada lançamento entra no mês em que conta no Início: o pagamento, no mês da conta que ele paga; a
  conta avulsa, no mês da data dela.
- Só quem registrou um lançamento pode alterá-lo ou excluí-lo.
- Excluído um pagamento, o mês da conta volta a aparecer como a pagar no Início.

## Critérios de aceite

- [ ] A lista mostra os pagamentos e as contas avulsas do membro logado, e nenhum de outro membro.
- [ ] O total do mês é a soma dos lançamentos do membro naquele mês.
- [ ] Ao tocar num lançamento, abrem os detalhes dele, com o comprovante, Alterar e Excluir.
- [ ] O botão Nova conta avulsa fica nesta aba, e não no Início.
- [ ] Excluído um pagamento, a conta volta a aparecer como a pagar no Início, naquele mês.
