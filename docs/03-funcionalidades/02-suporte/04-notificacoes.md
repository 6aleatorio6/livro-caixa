# Notificações

O app avisa a família pelo Android. Esta página trata de como o celular se prepara para receber os
avisos: a permissão, os canais, o cadastro do celular, a saída da conta e os ajustes do Android.

## Quem usa e quando

Todo membro. O celular se cadastra sozinho quando a pessoa abre o app depois de liberada; a pessoa só
age ao responder ao pedido de permissão do Android e, depois, nos ajustes do Android.

## Permissão

- Na primeira abertura do app com a pessoa liberada, o Android pede a permissão para enviar
  notificações. O pedido aparece uma vez: quem recusa não é perguntado de novo pelo app.
- Aceita a permissão, o celular fica cadastrado para receber os avisos.
- Quem recusou, ou desligou as notificações do app nos ajustes do Android, não recebe os avisos e
  continua usando o app sem diferença. Para voltar atrás, a pessoa liga as notificações nos
  [ajustes do Android](#os-ajustes-do-android); na abertura seguinte, o celular se cadastra.

## Canais

O Android agrupa as notificações do app em canais, e a pessoa liga, desliga e muda o som de cada um
nos ajustes do Android. O app tem dois:

| Canal | Nome nos ajustes | Para quê |
|---|---|---|
| `entries` | Lançamentos | o aviso de que outra pessoa da família registrou um lançamento |
| `billReminders` | Vencimentos | o lembrete de uma conta que vence |

Os dois têm importância padrão: a notificação aparece e toca o som padrão, sem interromper com um
alerta na tela. Como o Android não garante a hora exata de um aviso, o lembrete pode chegar com
alguns minutos de atraso.

## O cadastro do celular

- O celular guarda no banco o endereço que o serviço de push do Expo lhe deu, junto com a conta de
  quem entrou nele. É com esses endereços que o app sabe para quais celulares avisar.
- O cadastro é refeito a cada abertura do app, e dura enquanto a pessoa não sair da conta. Se outra
  pessoa entra no mesmo celular, o endereço passa a ser dela.
- Se o cadastro falha (sem internet, por exemplo), o app não mostra aviso nem trava: tenta de novo na
  próxima abertura.

## Sair da conta

Quem sai da conta tem o endereço do celular apagado do banco antes de a sessão acabar, para o celular
parar de receber os avisos dela. Se apagar falha, a pessoa sai do mesmo jeito. Sem internet, a saída
espera no máximo alguns segundos e segue; nesse caso o endereço fica no banco até outra pessoa entrar
no celular. Sair num celular não mexe no cadastro dos outros celulares da mesma pessoa.

Sem a permissão dada, não há endereço a apagar, e a saída segue direto
([Acesso](01-acesso.md#sair)).

## Os ajustes do Android

Em [Configurações](03-configuracoes.md), a seção Neste celular tem a linha Notificações, com o texto
"Abre os ajustes do Android para o app". Tocar nela abre a tela de notificações do app no Android,
onde a pessoa liga ou desliga os avisos e escolhe por canal. O app não tem interruptor próprio: quem
desligou ou recusou a permissão a religa ali, e o app não guarda essa opção.

A decisão e o que o Expo precisa para enviar estão em
[Plataforma e Stack](../../05-arquitetura/01-plataforma-e-stack.md) e em
[Notificações por Push](../../05-arquitetura/07-notificacoes-por-push.md).

## Critérios de aceite

- [ ] Na primeira abertura com a pessoa liberada, o Android pede a permissão de notificações uma vez.
- [ ] Com a permissão dada, o celular aparece no cadastro de endereços, com a conta de quem entrou.
- [ ] Quem recusou a permissão não é perguntado de novo e não é cadastrado.
- [ ] O app cria os canais Lançamentos e Vencimentos antes de pedir a permissão.
- [ ] Se o cadastro falha, o app não mostra aviso e segue funcionando.
- [ ] Ao sair da conta, o endereço do celular é apagado do banco antes de a sessão acabar.
- [ ] Se apagar o endereço falha, a pessoa sai da conta do mesmo jeito.
- [ ] Sem a permissão, sair da conta não tenta apagar nenhum endereço.
- [ ] Em Configurações, a linha Notificações abre os ajustes do Android para o app.
