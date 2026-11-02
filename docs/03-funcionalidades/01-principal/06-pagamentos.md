# Pagamentos

Os lançamentos da família, de uma pessoa por vez ou de todos juntos: os
[pagamentos de contas recorrentes](03-pagamento-de-conta-recorrente.md) e as
[contas avulsas](04-conta-avulsa.md) que cada membro registrou. É a aba do meio do app. Ela abre nos
lançamentos de quem está logado, e é daqui que o membro altera ou exclui o que registrou. Tudo na
lista é um pagamento: a conta avulsa não tem valor previsto e só é registrada já paga, junto com o
comprovante.

## Quem usa e quando

Todo membro, para conferir o que ele mesmo pagou, corrigir um lançamento ou ver o que outro membro
pagou.

## O que aparece na tela

- **Os chips com os membros da família:** "Todos" primeiro, depois "Você" e quem já entrou no app,
  pelo primeiro nome. A aba abre em "Você"; tocar no chip de outro membro mostra os lançamentos dele,
  e em "Todos", os da família inteira.
- **O total que a pessoa escolhida registrou no mês** e a parte dela no que a família pagou. Ex.:
  "Bruno registrou em outubro, R$ 800,00, 2 lançamentos, 28% do que a família pagou". Em "Todos", o
  total da família, sem a parte: "A família registrou em outubro, R$ 2.787,35, 4 lançamentos".
- **A lista dos lançamentos dela no mês, agrupada por tag:** as tags em ordem alfabética, cada uma
  com o total, e o grupo Sem tag por último. Dentro do grupo, do mais recente para o mais antigo, com
  o nome da conta, a data, o valor e se é um pagamento ou uma conta avulsa. A linha não repete a
  tag, que está no grupo. Em "Todos", a linha diz também quem pagou.
- **A troca de mês**, como no [Início](01-inicio.md): dos meses anteriores até o próximo mês. Ela
  não muda a pessoa escolhida.
- **O botão Nova conta avulsa**, que abre o registro de uma [conta avulsa](04-conta-avulsa.md).

Ao tocar num lançamento, abrem os [detalhes](07-detalhes-do-lancamento.md) dele, com o comprovante.
Alterar e Excluir aparecem só nos lançamentos de quem está logado.

Sem lançamentos da pessoa no mês, a tela diz "Nenhum pagamento seu em outubro", com o que fazer para
algo aparecer, ou "Nenhum pagamento de Bruno em outubro", para outro membro. Em "Todos", "Nenhum
pagamento em outubro", também com o que fazer.

## Regras

- A lista mostra os lançamentos de uma pessoa por vez, ou os da família inteira no chip "Todos".
- Quem foi adicionado à lista de e-mails e ainda não entrou no app não tem chip: não tem lançamento.
- Cada lançamento entra no mês em que conta no Início: o pagamento, no mês da conta que ele paga; a
  conta avulsa, no mês da data dela.
- Só quem registrou um lançamento pode alterá-lo ou excluí-lo.
- Excluído um pagamento, o mês da conta volta a aparecer como a pagar no Início.

## Critérios de aceite

- [ ] A aba abre nos lançamentos do membro logado, com o chip "Você" marcado.
- [ ] Tocar no chip de outro membro mostra os lançamentos dele, e só os dele, com o total dele no
      mês.
- [ ] Um membro que ainda não entrou no app não tem chip.
- [ ] O chip "Todos" mostra os lançamentos da família inteira, agrupados por tag, com quem pagou em
      cada linha, e o total da família no mês, sem porcentagem.
- [ ] A lista é agrupada por tag, com as tags em ordem alfabética, o total de cada grupo e Sem tag
      por último.
- [ ] O total do mês é a soma dos lançamentos da pessoa escolhida naquele mês.
- [ ] O pagamento de novembro registrado em outubro aparece em novembro, não em outubro.
- [ ] Trocar de mês mantém a pessoa escolhida.
- [ ] Ao tocar num lançamento, abrem os detalhes dele, com o comprovante; Alterar e Excluir só
      aparecem nos do membro logado.
- [ ] Sem lançamentos de outro membro no mês, a tela diz "Nenhum pagamento de Bruno em outubro".
- [ ] O botão Nova conta avulsa fica nesta aba, e não no Início.
- [ ] Excluído um pagamento, a conta volta a aparecer como a pagar no Início, naquele mês.
