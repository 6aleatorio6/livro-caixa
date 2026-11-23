# Contas Recorrentes

As contas que a família paga todo mês. Cada conta recorrente é da família, não de um membro, e pode
ter uma tag. Ela é cadastrada uma vez, e cada mês em que vale aparece como a pagar até alguém registrar
o pagamento, as [contribuições](08-contribuicao.md) alcançarem o valor previsto ou alguém pular o
mês. Por enquanto a única recorrência é a mensal.

## Quem usa e quando

Qualquer membro cadastra, altera e exclui as contas recorrentes, na aba
[Configurações](../02-suporte/03-configuracoes.md), e qualquer membro paga qualquer uma delas
([Pagamento de Conta Recorrente](03-pagamento-de-conta-recorrente.md)).

## O que se cadastra

| Campo | Regra |
| --- | --- |
| Nome | Obrigatório, até 60 caracteres |
| Valor previsto | Obrigatório. Quem paga confirma ou corrige o valor no pagamento |
| Dia do mês | De 1 a 31 |
| Vale a partir de | Data, obrigatória. Antes dela, a conta não aparece |
| Tag | Opcional ([Tags](../02-suporte/02-tags.md)) |

A conta vale até ser excluída: não há data de fim.

## Os meses da conta

- Os meses não são cadastrados um a um. Cada mês em que a conta vale sai do cadastro, e aparece
  como a pagar no [Início](01-inicio.md) até ter um pagamento.
- Num mês mais curto, o dia cai no último dia do mês: uma conta do dia 31 vence no dia 30 em abril
  e no último dia de fevereiro.
- Cada mês da conta tem no máximo um pagamento, e fica com o primeiro membro que pagar.
- Um mês com [contribuições](08-contribuicao.md) abaixo do valor previsto continua a pagar, pelo que
  falta. Quando elas alcançam o valor previsto, o mês está pago.
- Um mês que passou sem pagamento fica atrasado: continua a pagar no mês dele e aparece também nas
  contas a pagar do [Início](01-inicio.md) do mês atual, com o selo "Atrasada", até alguém pagá-lo
  ou pulá-lo. Ex.: a Água de outubro sem pagamento aparece nas contas a pagar de novembro.
- Pular um mês atrasado tira ele das contas a pagar, sem contar em nenhum mês. Ex.: a escola não
  cobrou em janeiro, e em fevereiro alguém pula janeiro. Só um mês atrasado e sem contribuições
  pode ser pulado, por qualquer membro, pelo [pagamento](03-pagamento-de-conta-recorrente.md). O
  mês pulado aparece só no Início do mês dele, nas Puladas. Tocar nele abre o pagamento, direto. O
  pulo só se desfaz pelo Desfazer do aviso, logo depois de pular.
- A recorrência é mensal. Outras recorrências ficam de fora por enquanto
  ([Recorrências além da mensal](../../04-escopo-excluido/04-recorrencias-alem-da-mensal.md)).

## Alterar e excluir

- Alterar a conta muda todos os meses que ainda não têm pagamento nem contribuição, passados ou
  futuros. Os meses já pagos e os meses com contribuições não mudam: desde a primeira contribuição,
  o mês guarda o valor previsto daquele momento.
- Excluir a conta tira os meses que ainda não têm pagamento nem contribuição. Os pagamentos já
  registrados continuam, com a referência à conta, e os meses com contribuições também, com a soma
  delas. Excluir pede confirmação.

## Critérios de aceite

- [ ] Uma conta aparece como a pagar em cada mês a partir da data em que vale.
- [ ] Uma conta do dia 31 vence no último dia de um mês mais curto.
- [ ] Uma conta não paga em novembro continua a pagar em novembro e aparece nas contas a pagar de
      dezembro, como atrasada.
- [ ] Um mês pulado sai das contas a pagar e das atrasadas, e não conta em nenhum mês.
- [ ] O Desfazer do aviso, logo depois de pular, devolve o mês às contas a pagar.
- [ ] Um mês com contribuições não pode ser pulado.
- [ ] O mês atual e o próximo não podem ser pulados: só um mês atrasado.
- [ ] Depois de alterar o valor previsto, os meses sem pagamento mostram o valor novo, e os meses
      pagos mantêm o valor do pagamento.
- [ ] Depois de excluir a conta, os pagamentos já feitos continuam, e a conta deixa de aparecer
      como a pagar.
- [ ] Depois de alterar o valor previsto, um mês com contribuições mantém o valor previsto que
      tinha.
- [ ] Depois de excluir a conta, as contribuições de um mês ainda a pagar continuam contando nele.
- [ ] Uma conta recorrente é salva sem tag.
- [ ] Qualquer membro, não só o admin, cadastra, altera e exclui uma conta recorrente.
