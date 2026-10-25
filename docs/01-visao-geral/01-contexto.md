# Contexto

## O cenário

Uma família divide as contas: algumas se repetem todo mês, outras aparecem uma vez só. Mais de uma
pessoa paga, e todas precisam saber o que já foi pago no mês e o que ainda falta.

## A solução

Um app de celular, feito para uma família, em que cada membro registra as contas da família que
pagou, sempre com o comprovante, e todos veem o mesmo resumo do mês: o que já foi pago e o que ainda vai
ser pago.

## O nome

O app se chama **Livro-Caixa**, o livro em que se anota o que entra e o que sai, aqui o das contas
da família. "Paia" fica fora do nome e aparece escondido na arte da splash screen, a tela de
abertura do app, como easter egg. Como ele se esconde na arte fica para o design.

## Os limites do produto

- **Só as contas da família.** O app guarda só as contas que a família considera gasto dela: as
  [recorrentes](../03-funcionalidades/01-principal/02-contas-recorrentes.md) e as
  [avulsas](../03-funcionalidades/01-principal/04-conta-avulsa.md).
- **Simples, para uma família só.** Não há várias famílias no mesmo banco de dados
  ([Várias famílias](../04-escopo-excluido/01-varias-familias.md)).
- **Só no Android.** Não há versão web nem para iOS ([Versão web](../04-escopo-excluido/02-versao-web.md),
  [iOS](../04-escopo-excluido/05-ios.md)).
- **Só em português**, com os valores em reais.
- **Acesso fechado.** Entra só quem tem um e-mail do Google liberado pelo admin
  ([Acesso](../03-funcionalidades/02-suporte/01-acesso.md)).
