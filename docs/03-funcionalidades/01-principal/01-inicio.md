# Início

A primeira tela do app mostra o mês da família: o que já foi pago e o que ainda vai ser pago. Todos os membros veem a mesma tela, com os mesmos números.

É a primeira das três abas do app, ao lado de [Meus Pagamentos](06-meus-pagamentos.md) e de
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
  cada membro pagou.
- **A lista do mês**, abaixo do gráfico: os lançamentos e as contas a pagar. Tocar num lançamento
  abre os [detalhes](07-detalhes-do-lancamento.md) dele, para qualquer membro.
- **A troca de mês**, para ver os meses anteriores.

O formato do gráfico fica para o design.

## Regras

- Os números são da família, não de um membro.
- Cada mês mostra só as próprias contas. Uma conta de setembro que não foi paga continua a pagar
  em setembro e não aparece em outubro.
- O pagamento de uma conta recorrente conta no mês da conta que ele paga, e no nome de quem pagou.
- A conta avulsa entra no mês da data dela.
- Um lançamento sem tag entra no total do mês, mas em nenhuma tag.

## Critérios de aceite

- [ ] Dois membros diferentes veem os mesmos valores no Início.
- [ ] Um pagamento ou uma conta avulsa registrada aparece no que já foi pago no mês.
- [ ] Uma conta recorrente sem pagamento no mês aparece no que ainda vai ser pago, pelo valor
      previsto.
- [ ] O Início mostra quanto foi em cada tag e quanto cada membro pagou.
- [ ] Dá para trocar para um mês anterior e ver os números dele.
- [ ] Uma conta de setembro sem pagamento não aparece no Início de outubro.
- [ ] Uma conta avulsa com data de 30 de setembro, registrada em 2 de outubro, entra em setembro.
