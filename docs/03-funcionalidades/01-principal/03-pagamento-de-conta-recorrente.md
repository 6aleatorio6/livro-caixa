# Pagamento de Conta Recorrente

O membro registra que pagou uma [conta recorrente](02-contas-recorrentes.md) num mês, com o valor
pago e o comprovante. O pagamento fica no nome dele.

## Quem usa e quando

Qualquer membro, depois de pagar uma conta da família.

## Fluxo

1. O membro escolhe a conta recorrente e o mês que ela ainda tem a pagar, até o próximo mês. As
   atrasadas, de meses anteriores, ficam no [Início](01-inicio.md) do mês atual e no
   [compartilhamento do Android](05-comprovantes.md#compartilhar-pelo-android).
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
- **A conta atrasada**, de um mês anterior, conta e aparece só no mês em que é paga, e sai do mês
  dela. A tela mostra o selo "Atrasada" ao lado do nome e avisa desde quando ela está atrasada e em
  que mês o pagamento conta ("Atrasada desde 20 de outubro. O pagamento conta em novembro, o mês em
  que você paga."). A atrasada com contribuições é a exceção: o pagamento dela conta no mês da
  conta, junto com as contribuições, como antes das atrasadas.
- **Pular o mês**, embaixo do botão de registrar ("Pular outubro"), só no pagamento de uma conta
  atrasada, tira o mês das contas a pagar, depois de confirmar, sem contar em nenhum mês. Ele não
  aparece no mês atual, no próximo nem num mês com contribuições. Depois de pular, a tela fecha, e
  um aviso diz "Água de outubro pulada." com Desfazer.
- **A conta pulada** abre o mesmo pagamento da atrasada, pelo toque nas Puladas do mês dela, sem o
  Pular. Paga, ela conta e aparece só no mês em que é paga.
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
- [ ] Paga em novembro, uma conta atrasada de outubro conta em novembro, e a tela avisa antes.
- [ ] Pular outubro, confirmado, tira a conta de outubro das contas a pagar e das atrasadas.
- [ ] Num mês com contribuições, o Pular não aparece.
- [ ] No pagamento do mês atual e do próximo, o Pular não aparece.
- [ ] Paga em novembro, uma conta pulada de outubro conta em novembro.- [ ] Depois do pagamento, a conta deixa de aparecer como a pagar naquele mês.
- [ ] Um membro não consegue alterar nem excluir o pagamento de outro.
- [ ] Um valor abaixo de 30% do previsto liga Paguei só uma parte e o desabilita.
- [ ] Com Paguei só uma parte ligado, o registro é uma contribuição.
- [ ] Num mês com contribuições, o pagamento abaixo da soma delas é recusado.
- [ ] O pagamento com contribuições não é excluído.
