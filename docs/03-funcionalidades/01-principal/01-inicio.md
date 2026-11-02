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
- **A troca de mês**, para ver os meses anteriores e o próximo mês. O Início abre no mês atual, e a
  troca para no próximo mês, que mostra as contas recorrentes dele a pagar e os pagamentos já
  feitos para ele. O mês atual leva o selo "Este mês", e o próximo, "Mês que vem"; os anteriores não
  têm selo.

Sem nenhuma conta recorrente cadastrada, o Início mostra o gráfico vazio e o botão para cadastrar as
[contas recorrentes](02-contas-recorrentes.md).

O formato do gráfico fica para o design.

## Regras

- Os números são da família, não de um membro.
- Cada mês mostra só as próprias contas. Uma conta de setembro que não foi paga continua a pagar
  em setembro e não aparece em outubro.
- O pagamento de uma conta recorrente conta no mês da conta que ele paga, e no nome de quem pagou.
  Ex.: Ana paga o Aluguel de novembro em 28 de outubro; o Início de outubro não muda, e o de
  novembro mostra o Aluguel pago, no nome de Ana.
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
- [ ] Dá para trocar para um mês anterior e ver os números dele.
- [ ] O mês atual mostra o selo "Este mês", o próximo mostra "Mês que vem", e um mês anterior não
      mostra selo.
- [ ] Dá para avançar até o próximo mês, que mostra as contas recorrentes dele a pagar; nele, o
      Próximo mês fica desabilitado.
- [ ] Um pagamento de novembro registrado em outubro aparece pago em novembro e não muda outubro.
- [ ] Uma conta de setembro sem pagamento não aparece no Início de outubro.
- [ ] Uma conta avulsa com data de 30 de setembro, registrada em 2 de outubro, entra em setembro.
- [ ] Na separação por membro, quem registrou um lançamento aparece com o valor pago menos as
      contribuições, e cada contribuinte com o que contribuiu.
- [ ] As contribuições não mudam o total do mês nem a separação por tag.
- [ ] Uma conta com contribuições abaixo do previsto aparece a pagar pelo que falta, com quem
      contribuiu.
