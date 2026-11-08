# Pagamentos

Os lançamentos da família no mês, das pessoas que se marcam nos chips, uma ou várias, ou de todas
juntas: os [pagamentos de contas recorrentes](03-pagamento-de-conta-recorrente.md) e as
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
  pelo primeiro nome. A aba abre só com "Você" marcado. Os chips se marcam em mais de um: tocar no
  chip de uma pessoa marca ou desmarca a parte dela, e a lista mostra as partes de todas as
  marcadas. O último chip marcado não desmarca, para a lista nunca ficar sem ninguém. "Todos" marca
  todos os chips de pessoa e fica marcado enquanto todas estão marcadas, mesmo que cada uma tenha
  sido marcada à mão; tocar nele com todas marcadas não muda nada.
- **O total das pessoas marcadas no mês** e quanto isso é do que a família pagou. É a soma das
  linhas da lista, e o título diz de quem é: "Sua parte em outubro" com só "Você" marcado, "Parte de
  Bruno em outubro" com só outro membro, "Partes de Você e Bruno em outubro" com mais de uma pessoa
  ("Você, Ana e Bruno" com três) e, com todas, "A família registrou em outubro". Ex.: "Sua parte em
  outubro, R$ 800,00, 2 lançamentos, 28% do que a família pagou". Cada linha conta como um
  lançamento. A parte de cada pessoa conta o valor que ela pagou menos as contribuições recebidas,
  mais as contribuições que fez, e dá o mesmo número da separação por membro no
  [Início](01-inicio.md). Em "Todos", o total da família, sem a porcentagem: "A família registrou em
  outubro, R$ 2.787,35, 5 lançamentos".
- **A lista das partes no mês, agrupada por tag:** as tags em ordem alfabética, cada uma com o
  total das linhas dela, e o grupo Sem tag por último. Cada linha é a parte de uma pessoa marcada
  numa conta, com o nome da conta, a data, o valor e a marca do que ela é: o check do pagamento, o
  recibo da conta avulsa e as moedas da contribuição. A linha não repete a tag, que está no grupo.
- **Em todo filtro, cada pessoa tem a sua linha na conta.** A conta paga com contribuições vira uma
  linha por pessoa marcada: a de quem pagou, com a parte dele (o valor pago menos as
  contribuições), e uma por contribuição. Ex.: a Luz de R$ 187,35, paga por Ana com R$ 40,00 de
  Bruno. Com Ana marcada, a linha dela mostra R$ 147,35; com Bruno, a linha dele mostra R$ 40,00,
  como uma contribuição; com os dois, ou em "Todos", aparecem as duas linhas, que somam os
  R$ 187,35. A parte de quem pagou aparece mesmo zerada, "R$ 0,00", quando as contribuições cobrem
  a conta toda: foi ele quem registrou o pagamento e é por essa linha que o altera ou exclui, e ela
  não muda nenhuma soma.
- **A ordem dentro do grupo:** as contas vão da mais recente para a mais antiga, e a contribuição
  fica logo abaixo do pagamento que recebe, não pela data. Com várias contribuições na mesma conta,
  a mais antiga vem primeiro. A contribuição de quem está marcado, sem o pagamento dela na lista
  (quem pagou não está marcado), fica no lugar da conta.
- **O texto de apoio da linha** muda com o que está marcado. Com uma pessoa só: "pago em 11/10" e,
  na conta avulsa, "12/10 · avulsa"; quando a linha é só uma parte da conta, "pago em 11/10 · sua
  parte" (para outro membro, "parte de" e o nome dele); na contribuição, "contribuição em 12/10 ·
  para Ana", com o nome de quem pagou a conta. Com várias pessoas ou em "Todos", o nome de quem
  pagou ou de quem contribuiu vai no fim: "pago em 08/10 · Bruno", "pago em 11/10 · parte de Ana",
  "contribuição em 12/10 · Bruno", "12/10 · avulsa · Bruno". Para o leitor de tela, o rótulo da
  linha traz o nome da conta, o texto de apoio e o valor ("Luz, contribuição em 08/11 · Bruno,
  R$ 40,00"), e assim distingue as duas linhas da mesma conta.
- **A troca de mês**, como no [Início](01-inicio.md): de outubro de 2026, o primeiro mês do app, até
  o próximo mês. Em outubro de 2026, o Mês anterior fica desabilitado. Ela não muda as pessoas
  escolhidas.
- **O botão Nova conta avulsa**, que abre o registro de uma [conta avulsa](04-conta-avulsa.md).

Ao tocar numa linha, abrem os [detalhes](07-detalhes-do-lancamento.md) do que ela mostra: os do
pagamento, na linha de quem pagou e na da conta avulsa, e os da contribuição, na linha dela, com o
comprovante da contribuição e o do pagamento. Alterar e Excluir aparecem só nos lançamentos de quem
está logado.

Sem linhas das pessoas marcadas no mês, a tela diz "Nenhum pagamento seu em outubro" com só "Você"
marcado, "Nenhum pagamento de Bruno em outubro" com só outro membro, "Nenhum pagamento das pessoas
escolhidas em outubro" com várias e, em "Todos", "Nenhum pagamento em outubro". Com "Você" ou
"Todos", ela diz também o que fazer para algo aparecer.

## Regras

- A lista mostra as partes das pessoas marcadas, que podem ser várias, e o chip "Todos" marca
  todas. O último chip marcado não desmarca.
- Quem foi adicionado à lista de e-mails e ainda não entrou no app não tem chip: não tem lançamento.
  Se uma pessoa marcada sai da lista, o chip dela some, e sem ninguém marcado vale o "Você".
- Cada lançamento entra no mês em que conta no Início: o pagamento, no mês da conta que ele paga; a
  conta avulsa, no mês da data dela.
- Só quem registrou um lançamento pode alterá-lo ou excluí-lo. Os detalhes de uma contribuição só
  se abrem aqui, tocando na linha dela.
- A contribuição entra no mês e na tag do lançamento que ela recebe, e é uma linha própria, logo
  abaixo do pagamento.
- O mês com contribuições e sem pagamento registrado não é de ninguém e não entra na lista de
  ninguém: cada contribuinte vê a sua contribuição.
- Quem só tem contribuições também ganha chip.
- Excluído um pagamento, o mês da conta volta a aparecer como a pagar no Início.

## Critérios de aceite

- [ ] A aba abre nos lançamentos do membro logado, com só o chip "Você" marcado.
- [ ] Os chips se marcam em mais de um, e a lista mostra as partes de todas as pessoas marcadas,
      agrupadas por tag.
- [ ] Você e Ana marcados somam as duas partes no total do cartão.
- [ ] O último chip marcado não desmarca.
- [ ] "Todos" marca todos os chips de pessoa e fica marcado enquanto todas estão marcadas; tocar nele
      com todas marcadas não muda nada.
- [ ] Com só outro membro marcado, a lista mostra só as partes dele, com o total dele no mês.
- [ ] Um membro que ainda não entrou no app não tem chip.
- [ ] Em "Todos", a lista mostra as partes da família inteira, agrupadas por tag, com quem pagou ou
      contribuiu em cada linha, e o total da família no mês, sem porcentagem.
- [ ] A lista é agrupada por tag, com as tags em ordem alfabética, o total de cada grupo e Sem tag
      por último.
- [ ] A Luz de R$ 187,35, paga por Ana com R$ 40,00 de Bruno, aparece uma vez por pessoa marcada:
      R$ 147,35 na linha de Ana e R$ 40,00 na de Bruno, como contribuição.
- [ ] A contribuição fica logo abaixo do pagamento que recebe, não pela data.
- [ ] Quando as contribuições cobrem a conta toda, a parte de quem pagou continua na lista, com
      R$ 0,00, e abre os detalhes do pagamento.
- [ ] A soma das linhas é o total do cartão, e o total de uma pessoa é o mesmo número da separação
      por membro no Início.
- [ ] O título do cartão diz de quem é o total: "Sua parte", "Parte de Bruno", "Partes de Você e
      Bruno" ou, em "Todos", "A família registrou".
- [ ] A porcentagem do que a família pagou aparece fora de "Todos".
- [ ] O texto de apoio da linha traz "sua parte" ou "para Ana" com uma pessoa marcada, e o nome de
      quem pagou ou contribuiu com várias ou em "Todos".
- [ ] Tocar na linha do pagamento abre os detalhes do pagamento, e na da contribuição, os detalhes
      dela.
- [ ] Tocar na contribuição de quem está logado abre os detalhes dela, com Alterar e Excluir.
- [ ] O pagamento de novembro registrado em outubro aparece em novembro, não em outubro.
- [ ] Trocar de mês mantém as pessoas escolhidas.
- [ ] Em outubro de 2026, o primeiro mês do app, o Mês anterior fica desabilitado; nos meses
      depois dele, fica habilitado.
- [ ] Alterar e Excluir só aparecem nos detalhes dos lançamentos do membro logado.
- [ ] Sem linhas das pessoas marcadas no mês, a tela diz "Nenhum pagamento de Bruno em outubro" com
      um membro, "Nenhum pagamento das pessoas escolhidas em outubro" com várias e "Nenhum pagamento
      em outubro" em "Todos".
- [ ] O botão Nova conta avulsa fica nesta aba, e não no Início.
- [ ] Excluído um pagamento, a conta volta a aparecer como a pagar no Início, naquele mês.
