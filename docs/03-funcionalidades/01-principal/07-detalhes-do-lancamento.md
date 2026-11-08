# Detalhes do Lançamento

Tudo sobre um lançamento, um pagamento de conta recorrente, uma conta avulsa ou uma
[contribuição](08-contribuicao.md), com o comprovante.
Qualquer membro abre os detalhes de qualquer lançamento; só quem registrou altera ou exclui.

## Quem usa e quando

Todo membro, ao tocar num lançamento da lista do [Início](01-inicio.md) ou de
[Pagamentos](06-pagamentos.md).

## O que aparece na tela

Os detalhes abrem numa folha que sobe de baixo, por cima da lista:

- o nome da conta e o tipo: o pagamento de uma conta recorrente, com o mês, ou a conta avulsa;
- o valor pago e, no pagamento, o valor previsto da conta;
- quem registrou e em que dia;
- no pagamento, o dia de vencimento da conta; na conta avulsa, a data dela;
- a [tag](../02-suporte/02-tags.md), se tiver;
- o comprovante, que abre ao tocar em Ver
  ([Ver o comprovante](05-comprovantes.md#ver-o-comprovante)).

Com contribuições, a folha mostra também:

- a parte de quem pagou: "Fica com Ana", o valor pago menos as contribuições;
- a lista de contribuições, com o total no título; cada uma é uma linha de texto, com quem
  contribuiu e quando ("Bruno · 12/10") e o valor, sem o comprovante dela. A folha do pagamento
  mostra só o comprovante do pagamento;
- o Contribuir, para quem não registrou o lançamento, que abre a contribuição com o lançamento de
  quem pagou no topo. Quando a soma das contribuições chega ao valor pago, ele fica desabilitado, e
  embaixo do título das contribuições a folha diz por quê;
- na conta paga só pelas contribuições, sem o comprovante da conta inteira, o "Anexar o comprovante
  da conta", que abre o pagamento do mês com a soma das contribuições como valor. Essa folha não tem
  Alterar nem Excluir.

Os detalhes de uma contribuição são a mesma folha, abertos pela linha dela em
[Pagamentos](06-pagamentos.md): a conta, o valor, a conta que ela recebe ("na conta Luz de
R$ 187,35, paga por Ana"), quem contribuiu e quando. Eles mostram dois comprovantes, cada um com o
seu Ver: o "Comprovante da contribuição" e, quando a conta tem dono, o dela, que se chama
"Comprovante do pagamento" no pagamento e "Comprovante da conta avulsa" na conta avulsa. Se a conta
foi paga só pelas contribuições, sem o comprovante da conta inteira, só o da contribuição aparece.
Essa folha não tem o "Fica com" nem a lista de contribuições.

Para quem registrou, a folha tem Alterar e Excluir. Para os outros membros, ela diz quem pode
alterar ou excluir. Com contribuições, o Excluir fica desabilitado, e a folha diz por quê.

## Regras

- Qualquer membro vê os detalhes e o comprovante de qualquer lançamento, como todos veem os mesmos
  números no Início.
- Só quem registrou altera ou exclui o lançamento. Excluir pede confirmação.
- Excluído um pagamento, o mês da conta volta a aparecer como a pagar no Início.
- O lançamento com contribuições não é excluído enquanto elas existirem.
- Quem registrou o lançamento não contribui nele.

## Critérios de aceite

- [ ] Um membro abre os detalhes de um lançamento de outro membro e vê o comprovante.
- [ ] Os detalhes de um lançamento de outro membro não têm Alterar nem Excluir, e dizem quem pode.
- [ ] Quem registrou vê Alterar e Excluir nos detalhes do próprio lançamento.
- [ ] Excluir pede confirmação antes de apagar o lançamento.
- [ ] Com contribuições, a folha mostra com quanto quem pagou fica e a lista das contribuições.
- [ ] Nos detalhes de um pagamento, cada contribuição é uma linha de texto, com quem contribuiu,
      quando e o valor, sem o comprovante dela; a folha mostra só o comprovante do pagamento.
- [ ] Os detalhes de uma contribuição mostram o comprovante dela e, quando a conta tem dono, o da
      conta ("Comprovante do pagamento" ou, na conta avulsa, "Comprovante da conta avulsa"), cada um
      com o seu Ver.
- [ ] Os detalhes de uma contribuição a uma conta paga só pelas contribuições mostram só o
      comprovante dela.
- [ ] Quem não registrou o lançamento tem o Contribuir; quem registrou, não.
- [ ] Quando a soma das contribuições chega ao valor pago, o Contribuir fica desabilitado.
- [ ] Com contribuições, o Excluir fica desabilitado.
- [ ] Na conta paga só pelas contribuições, o "Anexar o comprovante da conta" abre o pagamento com a
      soma delas.
