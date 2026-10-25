# Contas Recorrentes

As contas que a família paga todo mês. Cada conta recorrente é da família, não de um membro, e pode
ter uma tag. Ela é cadastrada uma vez, e cada mês em que vale aparece como a pagar até alguém registrar
o pagamento. Por enquanto a única recorrência é a mensal.

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
- Um mês que passou sem pagamento continua a pagar naquele mês. Ele não passa para o mês seguinte:
  o [Início](01-inicio.md) de cada mês mostra só as contas daquele mês.
- A recorrência é mensal. Outras recorrências ficam de fora por enquanto
  ([Recorrências além da mensal](../../04-escopo-excluido/04-recorrencias-alem-da-mensal.md)).

## Alterar e excluir

- Alterar a conta muda todos os meses que ainda não têm pagamento, passados ou futuros. Os meses
  já pagos não mudam.
- Excluir a conta tira os meses que ainda não têm pagamento. Os pagamentos já registrados
  continuam, com a referência à conta. Excluir pede confirmação.

## Critérios de aceite

- [ ] Uma conta aparece como a pagar em cada mês a partir da data em que vale.
- [ ] Uma conta do dia 31 vence no último dia de um mês mais curto.
- [ ] Uma conta não paga em setembro continua a pagar em setembro e não aparece em outubro.
- [ ] Depois de alterar o valor previsto, os meses sem pagamento mostram o valor novo, e os meses
      pagos mantêm o valor do pagamento.
- [ ] Depois de excluir a conta, os pagamentos já feitos continuam, e a conta deixa de aparecer
      como a pagar.
- [ ] Uma conta recorrente é salva sem tag.
- [ ] Qualquer membro, não só o admin, cadastra, altera e exclui uma conta recorrente.
