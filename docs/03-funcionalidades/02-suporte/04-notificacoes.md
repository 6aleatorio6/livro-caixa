# Notificações

O app avisa a família pelo Android. Esta página trata de como o celular se prepara para receber os
avisos (a permissão, os canais, o cadastro do celular, a saída da conta e os ajustes do Android) e do
primeiro aviso, o de um lançamento registrado.

## Quem usa e quando

Todo membro. O celular se cadastra sozinho quando a pessoa abre o app depois de liberada; a pessoa só
age ao responder ao pedido de permissão do Android e, depois, nos ajustes do Android. O aviso de um
lançamento chega a quem não o registrou, e quem o recebe pode tocá-lo para abrir o lançamento.

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

## Lançamento registrado

Quando alguém registra um lançamento, os outros membros da família recebem uma notificação no canal
Lançamentos, uma por celular cadastrado. Quem registrou não recebe a própria notificação, e quem saiu da
lista de e-mails permitidos também não, mesmo que o celular ainda esteja no cadastro.

| Lançamento | Título | Texto |
|---|---|---|
| Pagamento de uma conta, do mês ou atrasada | Bruno pagou a Água | Novembro · R$ 98,00 |
| Conta avulsa | Bruno registrou uma conta avulsa | Farmácia · R$ 54,90 |
| Contribuição | Bruno contribuiu na Internet | Novembro · R$ 40,00 |

- O título traz o primeiro nome de quem registrou. O mês do texto começa em maiúscula; no pagamento de
  uma conta atrasada, é o mês atrasado que ela pagou, e na contribuição, o mês do lançamento que a
  recebeu.
- Tocar na notificação abre os detalhes do lançamento. Na contribuição, abre os detalhes do lançamento
  que recebeu a contribuição, porque os da contribuição só abrem por Pagamentos.
- Se o app estava fechado, ou a sessão ainda carregava, o toque espera a pessoa ser liberada e só então
  abre o lançamento; até lá, vale o que o app mostra a quem não está liberada.
- No pagamento de uma conta do mês, os celulares recebem também uma mensagem silenciosa, que não
  aparece como notificação: o app a usa para cancelar o lembrete dessa conta.
- O aviso sai depois que o lançamento é gravado, sem atrasar a tela: o carregamento e o aviso de sucesso
  não esperam por ele. Se o aviso falha (sem internet, por exemplo), o lançamento fica registrado do
  mesmo jeito e a pessoa não vê erro nenhum. Lançamento que falha ao gravar não avisa ninguém.

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
- [ ] Ao pagar uma conta do mês, os outros membros com o celular cadastrado recebem "Fulano pagou a Conta",
      com o mês e o valor no texto; quem pagou não recebe.
- [ ] Ao pagar uma conta atrasada, o aviso é o mesmo, com o mês atrasado no texto.
- [ ] Ao registrar uma conta avulsa, o aviso diz "Fulano registrou uma conta avulsa", com o nome e o
      valor no texto.
- [ ] Ao registrar uma contribuição, o aviso diz "Fulano contribuiu na Conta", e o toque abre o lançamento
      que a recebeu.
- [ ] Quem saiu da lista de e-mails permitidos não recebe o aviso.
- [ ] Tocar no aviso com o app fechado abre o lançamento depois que a pessoa é liberada.
- [ ] Se o aviso falha, o lançamento fica registrado e a tela mostra só o aviso de sucesso.
- [ ] Um lançamento que falha ao gravar não envia aviso.
