# Pagamentos

Os lançamentos da família, de uma pessoa por vez ou de todos juntos: os
[pagamentos de contas recorrentes](03-pagamento-de-conta-recorrente.md) e as
[contas avulsas](04-conta-avulsa.md) que cada membro registrou, e as
[contribuições](08-contribuicao.md) de cada um. É a aba do meio do app. Ela abre nos
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
- **A parte da pessoa escolhida no mês** e quanto isso é do que a família pagou. Ex.: "Sua parte em
  outubro, R$ 800,00, 2 lançamentos, 28% do que a família pagou". A parte conta o valor pago menos
  as contribuições recebidas, mais as contribuições feitas, e dá o mesmo número da separação por
  membro no [Início](01-inicio.md). Em "Todos", o
  total da família, sem a parte: "A família registrou em outubro, R$ 2.787,35, 4 lançamentos".
- **A lista dos lançamentos dela no mês, agrupada por tag:** as tags em ordem alfabética, cada uma
  com o total, e o grupo Sem tag por último. Dentro do grupo, do mais recente para o mais antigo, com
  o nome da conta, a data, o valor e se é um pagamento ou uma conta avulsa. A linha não repete a
  tag, que está no grupo. Em "Todos", a linha diz também quem pagou.
- **Em "Todos", cada conta aparece uma vez**, com o valor pago, sem as partes. **No chip de um
  membro, o lançamento em que ele tem parte aparece expandido:** o valor pago e, embaixo, a parte
  dele em destaque e a dos outros. Ex.: na aba de Ana, a Luz de R$ 187,35 mostra "Sua parte
  R$ 147,35" e "Bruno · contribuição R$ 40,00"; na de Bruno, a mesma Luz mostra "Sua parte ·
  contribuição R$ 40,00" e "Ana · pagou a conta R$ 147,35". O total da tag conta só a parte do
  membro.
- **A troca de mês**, como no [Início](01-inicio.md): de outubro de 2026, o primeiro mês do app, até
  o próximo mês. Em outubro de 2026, o Mês anterior fica desabilitado. Ela não muda a pessoa
  escolhida.
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
- Só quem registrou um lançamento pode alterá-lo ou excluí-lo. Os detalhes de uma contribuição só
  se abrem aqui, tocando na parte de quem contribuiu.
- A contribuição entra no mês e na tag do lançamento que ela recebe.
- O mês com contribuições e sem pagamento registrado não é de ninguém e não entra na lista de
  ninguém: cada contribuinte vê a sua contribuição.
- Quem só tem contribuições também ganha chip.
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
- [ ] O total do mês é a soma das partes da pessoa escolhida naquele mês, o mesmo número da
      separação por membro no Início.
- [ ] Em "Todos", cada conta aparece uma vez, com o valor pago.
- [ ] No chip de um membro, o lançamento com contribuições mostra a parte dele em destaque e a dos
      outros.
- [ ] Tocar na contribuição de quem está logado abre os detalhes dela, com Alterar e Excluir.
- [ ] O pagamento de novembro registrado em outubro aparece em novembro, não em outubro.
- [ ] Trocar de mês mantém a pessoa escolhida.
- [ ] Em outubro de 2026, o primeiro mês do app, o Mês anterior fica desabilitado; nos meses
      depois dele, fica habilitado.
- [ ] Ao tocar num lançamento, abrem os detalhes dele, com o comprovante; Alterar e Excluir só
      aparecem nos do membro logado.
- [ ] Sem lançamentos de outro membro no mês, a tela diz "Nenhum pagamento de Bruno em outubro".
- [ ] O botão Nova conta avulsa fica nesta aba, e não no Início.
- [ ] Excluído um pagamento, a conta volta a aparecer como a pagar no Início, naquele mês.
