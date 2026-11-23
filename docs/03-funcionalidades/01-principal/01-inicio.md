# Início

A primeira tela do app mostra o mês da família: o que já foi pago e o que ainda vai ser pago. Todos os membros veem a mesma tela, com os mesmos números.

É a primeira das três abas do app, ao lado de [Pagamentos](06-pagamentos.md) e de
[Configurações](../02-suporte/03-configuracoes.md).

## Quem usa e quando

Todo membro, ao abrir o app.

## O que aparece na tela

- **Um gráfico do mês**, com duas partes:
  - o que já foi pago: os [pagamentos de contas recorrentes](03-pagamento-de-conta-recorrente.md)
    e as [contas avulsas](04-conta-avulsa.md) do mês;
  - o que ainda vai ser pago: as [contas recorrentes](02-contas-recorrentes.md) que ainda não têm
    pagamento no mês, pelo valor previsto.
- **A separação por tag e por membro:** quanto foi em cada [tag](../02-suporte/02-tags.md) e quanto
  cada membro pagou, com as [contribuições](08-contribuicao.md): quem registrou um lançamento fica
  com o valor pago menos as contribuições, e cada contribuinte com o que contribuiu.
- **A lista do mês**, abaixo do gráfico: os lançamentos e as contas a pagar. A tag de cada linha
  aparece como uma bolinha da cor dela, a mesma da separação por tag, e não pelo nome. Tocar num
  lançamento abre os [detalhes](07-detalhes-do-lancamento.md) dele, para qualquer membro. A lista não
  tem linhas de contribuição: cada conta aparece uma vez.
  - A conta a pagar com contribuições diz o que falta e de quem veio a contribuição ("faltam
    R$ 58,00 · R$ 40,00 de Bruno"), e tocar nela abre o pagamento.
  - A linha paga diz quanto veio de contribuições.
  - A conta paga só pelas contribuições aparece com a marca de pessoas, no lugar do check. Tocar
    nela abre os detalhes, com a lista de contribuições e o "Anexar o comprovante da conta".
  - A conta atrasada paga depois aparece só no mês em que foi paga, entre as pagas, com o selo
    cinza "De outubro" ("paga dia 5 · Ana"), e sai da lista do mês dela.
  - A conta pulada aparece só no mês dela, numa seção "Puladas" no fim da lista, sem valor, e não
    conta em nada: nem no que foi pago, nem no que falta pagar. Tocar nela abre o pagamento dela,
    direto; paga, ela sai do mês dela e aparece só no mês em que foi paga, como a atrasada paga.
  - No mês atual, as contas recorrentes de meses anteriores sem pagamento, as atrasadas, vêm no
    começo das contas a pagar, sem seção própria, com o selo vermelho "De outubro" e o dia em que
    venceu ("R$ 98,00 · venceu dia 20"). Tocar numa delas abre o pagamento.
- **O selo "Atrasada"**, vermelho, ao lado do nome de toda conta atrasada: nas contas a pagar do
  mês atual, na lista do mês dela, quando se volta a um mês anterior, no compartilhamento do
  Android e no pagamento. Fora do mês de origem, ele diz só de que mês a conta veio ("De
  outubro"): vermelho enquanto ela está a pagar, cinza depois de paga. Na lista do mês dela e no
  pagamento, que já dizem o mês, é "Atrasada".
- **A troca de mês**, para ver os meses anteriores e o próximo mês. O Início abre no mês atual, e a
  troca para no próximo mês, que mostra as contas recorrentes dele a pagar e os pagamentos já
  feitos para ele. Para trás, a troca começa em outubro de 2026, o primeiro mês do app: nele, o
  Mês anterior fica desabilitado. O mês atual leva o selo "Este mês", e o próximo, "Mês que vem";
  os anteriores não têm selo.

Sem nenhuma conta recorrente cadastrada, o Início mostra o gráfico vazio e o botão para cadastrar as
[contas recorrentes](02-contas-recorrentes.md).

O formato do gráfico fica para o design.

## Regras

- Os números são da família, não de um membro.
- Cada mês mostra as próprias contas. Uma conta de novembro que não foi paga continua a pagar em
  novembro e, de dezembro em diante, aparece também nas contas a pagar do mês atual, como atrasada.
  No mês atual, as atrasadas entram no que falta pagar, no gráfico e no resumo das contas a pagar,
  e o selo "Atrasada" as distingue das contas do mês.
- O pagamento de uma conta recorrente conta no mês da conta que ele paga, e no nome de quem pagou.
  Ex.: Ana paga o Aluguel de novembro em 28 de outubro; o Início de outubro não muda, e o de
  novembro mostra o Aluguel pago, no nome de Ana.
- O pagamento de uma conta atrasada conta e aparece só no mês em que é pago. Ex.: Ana paga a Água de
  outubro em 5 de novembro; ela aparece no Início de novembro, no nome de Ana, e sai do de outubro.
  A atrasada com contribuições é a exceção: paga depois, ela conta no mês dela, como antes das
  atrasadas, e aparece paga lá.
- A conta avulsa entra no mês da data dela.
- A contribuição conta no mês e na tag do lançamento que ela recebe. Ela não muda o total do mês nem
  a separação por tag, só quanto cada membro pagou.
- Na separação por tag, o que não tem tag aparece na linha Sem tag, sempre a última. Como cada conta
  tem no máximo uma tag, as linhas somam o que a família pagou no mês.

## Critérios de aceite

- [ ] Dois membros diferentes veem os mesmos valores no Início.
- [ ] Um pagamento ou uma conta avulsa registrada aparece no que já foi pago no mês.
- [ ] Uma conta recorrente sem pagamento no mês aparece no que ainda vai ser pago, pelo valor
      previsto.
- [ ] O Início mostra quanto foi em cada tag e quanto cada membro pagou.
- [ ] Uma conta avulsa sem tag aparece na linha Sem tag, a última da separação por tag.
- [ ] No mês atual, as contas de meses anteriores sem pagamento aparecem no começo das contas a
      pagar, com o selo "Atrasada".
- [ ] Paga em novembro, a Água de outubro aparece nas pagas de novembro, com o selo cinza "De
      outubro", e sai do Início de outubro.
- [ ] Nas contas a pagar de novembro, a atrasada de outubro tem o selo vermelho "De outubro".
- [ ] No mês atual, o que falta pagar inclui as atrasadas.
- [ ] Um mês pulado aparece só nas Puladas do mês dele, sem contar em nada, e sai das contas a
      pagar do mês atual.
- [ ] Paga em novembro, a Água de outubro pulada sai de outubro e aparece só nas pagas de novembro.
- [ ] Toda conta atrasada leva o selo "Atrasada" ao lado do nome, também na lista de um mês
      anterior.
- [ ] Dá para trocar para um mês anterior e ver os números dele.
- [ ] O mês atual mostra o selo "Este mês", o próximo mostra "Mês que vem", e um mês anterior não
      mostra selo.
- [ ] Dá para avançar até o próximo mês, que mostra as contas recorrentes dele a pagar; nele, o
      Próximo mês fica desabilitado.
- [ ] Em outubro de 2026, o primeiro mês do app, o Mês anterior fica desabilitado; nos meses
      depois dele, fica habilitado.
- [ ] Um pagamento de novembro registrado em outubro aparece pago em novembro e não muda outubro.
- [ ] Uma conta de novembro sem pagamento não aparece no Início de dezembro.
- [ ] Uma conta avulsa com data de 30 de novembro, registrada em 2 de dezembro, entra em novembro.
- [ ] Na separação por membro, quem registrou um lançamento aparece com o valor pago menos as
      contribuições, e cada contribuinte com o que contribuiu.
- [ ] As contribuições não mudam o total do mês nem a separação por tag.
- [ ] Uma conta com contribuições abaixo do previsto aparece a pagar pelo que falta, com quem
      contribuiu.
- [ ] Com R$ 2.677,90 a pagar, o valor fica dentro do anel; um valor maior diminui até caber numa
      linha.
