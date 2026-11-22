# Débito Técnico

**O que o código faz de um jeito mais complicado do que precisa, com o custo medido e a saída
escolhida.** Cada item diz quando sai: nenhum entra num branch que já mexe no mesmo lugar por outro
motivo.

## O pagamento sem dono fica entre os lançamentos

Quando a primeira contribuição chega a um mês ainda sem pagamento, nasce em `entries` um pagamento
sem `paidBy`, sem `amountCents` e sem `receiptFileId`. Ele não é dinheiro: só guarda o mês da conta
e as cópias do nome, da tag e do previsto, para as contribuições apontarem para ele. Quando alguém
paga o mês, o mesmo documento ganha o dono.

- **Custo, medido em 20/11/2026:** 29 arquivos do app tratam o caso, fora os testes, com 20
  checagens de "tem dono?" (`isOwnedEntry`, `isUnownedPayment`), uma folha de detalhes própria
  (`UnownedPaymentDetails`) e tipos separados (`OwnedEntry`, `UnownedPaymentEntry`,
  `AuthoredEntry`). As regras têm um validador só para ele e ramos próprios para criar, ganhar dono,
  perder dono e excluir.
- **Saída:** a contribuição de um mês de conta aponta para o mês, pelo id que o pagamento dele tem
  (`2026-11_luz`), e não para um documento. Sem pagamento, nada existe nesse id, e o mês aparece a
  pagar com o que falta; pagar o mês é criar um pagamento comum nesse id, e as contribuições passam a
  ser dele sem mudar. `entries` fica só com lançamentos que têm dono, e uma migração apaga os
  pagamentos sem dono ([Migrações de Dados](06-migracoes-de-dados.md)).
- **O que se perde:** no mês só com contribuições, o nome, a tag, o vencimento e o previsto vêm da
  conta como ela está, e não mais congelados na primeira contribuição. E as regras deixam de barrar
  pular ou pagar depois um mês com contribuições, porque não fazem consulta e nada existe no id do
  mês: o app esconde as duas ações nesse mês.
- **O que ficou de fora:** guardar o mês com contribuições na coleção dos meses atrasados, com um
  estado próprio e as cópias, que seria o mesmo pagamento sem dono em outra coleção, mudando de
  coleção quando alguém paga; e separar as contribuições numa coleção só delas, que não muda nada
  para quem usa e troca o filtro por tipo das telas por duas consultas.
- **O que muda para quem usa:** nada.
- **Quando:** num trabalho próprio, depois das notificações. Ele mede de novo os arquivos, as
  checagens e as linhas das regras, antes e depois.

## O `minVersion` ao lado do `version`

O documento `settings/app` guarda a versão mínima em dois campos: o `version`, que o app lê, e o
`minVersion`, que só os apps anteriores às [migrações](06-migracoes-de-dados.md) leem. Toda migração
grava os dois com o mesmo valor.

- **Custo:** um campo a mais no `settings/app` e a linha do `pnpm migrate` que o grava. O app não o
  lê.
- **Saída:** apagar o campo. Sem ele, um app antigo abre como antes, então ele só sai quando nenhum
  celular da família tiver instalado um app anterior às migrações, conferido em cada um.
- **O que muda para quem usa:** nada.
- **Quando:** sem data, depois de conferidos os celulares.
