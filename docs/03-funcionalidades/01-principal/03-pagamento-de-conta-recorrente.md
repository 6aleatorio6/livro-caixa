# Pagamento de Conta Recorrente

O membro registra que pagou uma [conta recorrente](02-contas-recorrentes.md) num mês, com o valor
pago e o comprovante. O pagamento fica no nome dele.

## Quem usa e quando

Qualquer membro, depois de pagar uma conta da família.

## Fluxo

1. O membro escolhe a conta recorrente e o mês que ela ainda tem a pagar.
2. Confirma o valor previsto da conta ou o corrige para o valor que pagou.
3. Anexa o [comprovante](05-comprovantes.md). Quando o membro chega pelo compartilhamento do
   Android, o comprovante já vem anexado.
4. Confirma. A conta deixa de aparecer como a pagar naquele mês, no [Início](01-inicio.md).

## Regras

- O pagamento é de uma conta num mês. O mês fica com o primeiro membro que registrar o pagamento:
  cada conta tem no máximo um pagamento por mês, e um segundo pagamento para o mesmo mês é
  recusado.
- O valor começa preenchido com o valor previsto da conta, e o membro pode corrigi-lo.
- O pagamento é sempre de quem está logado. Não há como registrá-lo em nome de outro membro.
- O comprovante é obrigatório.
- Só quem registrou o pagamento pode alterá-lo ou excluí-lo. Excluído o pagamento, o mês volta a
  aparecer como a pagar.
- Depois de registrado, o pagamento não muda quando a conta é alterada ou excluída.

## Critérios de aceite

- [ ] Sem comprovante, o pagamento não é salvo.
- [ ] O valor vem preenchido com o valor previsto e pode ser corrigido.
- [ ] O pagamento fica no nome do membro logado, sem opção de escolher outro.
- [ ] Um segundo pagamento da mesma conta para o mesmo mês é recusado.
- [ ] Depois do pagamento, a conta deixa de aparecer como a pagar naquele mês.
- [ ] Um membro não consegue alterar nem excluir o pagamento de outro.
