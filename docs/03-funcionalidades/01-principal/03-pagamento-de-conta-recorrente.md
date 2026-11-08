# Pagamento de Conta Recorrente

O membro registra que pagou uma [conta recorrente](02-contas-recorrentes.md) num mês, com o valor
pago e o comprovante. O pagamento fica no nome dele.

## Quem usa e quando

Qualquer membro, depois de pagar uma conta da família.

## Fluxo

1. O membro escolhe a conta recorrente e o mês que ela ainda tem a pagar, até o próximo mês.
2. Confirma o valor previsto da conta ou o corrige para o valor que pagou. Se pagou só uma parte,
   liga Paguei só uma parte, e o registro vira uma [contribuição](08-contribuicao.md).
3. Anexa o [comprovante](05-comprovantes.md). Quando o membro chega pelo compartilhamento do
   Android, o comprovante já vem anexado. O valor lido nele passa para o valor pago, se o membro não
   o tiver digitado.
4. Confirma. A conta deixa de aparecer como a pagar naquele mês, no [Início](01-inicio.md).

## Regras

- O pagamento é de uma conta num mês. O mês fica com o primeiro membro que registrar o pagamento:
  cada conta tem no máximo um pagamento por mês, e um segundo pagamento para o mesmo mês é
  recusado.
- O próximo mês já pode ser pago, antes de começar: pagar em outubro uma conta que vence no começo
  de novembro. O pagamento conta no mês da conta, não no dia em que foi feito, e o mês continua pago
  quando começa. Um mês depois do próximo é recusado.
- O valor começa preenchido com o valor previsto da conta, e o membro pode corrigi-lo. Com o
  comprovante anexado, passa a ser o valor lido nele
  ([O valor lido do comprovante](05-comprovantes.md#o-valor-lido-do-comprovante)).
- O pagamento é sempre de quem está logado. Não há como registrá-lo em nome de outro membro.
- O comprovante é obrigatório.
- Só quem registrou o pagamento pode alterá-lo ou excluí-lo. Excluído o pagamento, o mês volta a
  aparecer como a pagar.
- Depois de registrado, o pagamento não muda quando a conta é alterada ou excluída.
- **O interruptor Paguei só uma parte**, embaixo do valor, transforma o registro numa
  [contribuição](08-contribuicao.md). Abaixo de 30% do valor previsto do mês, ele vem ligado e
  desabilitado: o registro só pode ser uma contribuição. Ligado, o botão é Registrar contribuição.
- **Num mês com contribuições**, quem paga registra o valor inteiro da conta, e o texto de apoio diz
  que a conta inteira inclui as contribuições. O valor não pode ficar abaixo da soma delas. O mês
  continua com o valor previsto que tinha na primeira contribuição.
- **O pagamento com contribuições não é excluído** enquanto elas existirem, e o valor pago não baixa
  para menos que a soma delas.
- Em Alterar pagamento, o mesmo interruptor transforma o pagamento numa contribuição, com o mesmo
  valor e comprovante.

## Critérios de aceite

- [ ] Sem comprovante, o pagamento não é salvo.
- [ ] O valor vem preenchido com o valor previsto e pode ser corrigido.
- [ ] Anexado um comprovante com o valor lido, o valor pago passa a ser o lido.
- [ ] O pagamento fica no nome do membro logado, sem opção de escolher outro.
- [ ] Um segundo pagamento da mesma conta para o mesmo mês é recusado.
- [ ] Em outubro, uma conta de novembro pode ser paga, e uma de dezembro é recusada.
- [ ] Paga em outubro, a conta de novembro aparece paga quando novembro começa.
- [ ] Depois do pagamento, a conta deixa de aparecer como a pagar naquele mês.
- [ ] Um membro não consegue alterar nem excluir o pagamento de outro.
- [ ] Um valor abaixo de 30% do previsto liga Paguei só uma parte e o desabilita.
- [ ] Com Paguei só uma parte ligado, o registro é uma contribuição.
- [ ] Num mês com contribuições, o pagamento abaixo da soma delas é recusado.
- [ ] O pagamento com contribuições não é excluído.
