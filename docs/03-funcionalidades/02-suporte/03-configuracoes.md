# Configurações

A terceira aba do app reúne o que se usa pouco: o próprio nome, o que vale só para este celular (a
entrada com biometria e as notificações), o cadastro das contas recorrentes, as tags e, para o admin,
a lista de e-mails permitidos.

## Quem usa e quando

Todo membro, quando muda o próprio nome, liga ou desliga a entrada com biometria do próprio celular,
ou cadastra ou muda uma conta recorrente ou uma tag. O admin, também quando libera ou remove o e-mail
de uma pessoa da família.

## O que aparece na tela

- Quem está logado: o nome, o e-mail, para o admin a marca de admin, o lápis que abre a troca do
  próprio nome ([Acesso](01-acesso.md#o-próprio-nome)) e o ícone de sair
  ([Acesso](01-acesso.md#sair)).
- Neste celular, em todo celular: a linha Notificações, com o texto "Abre os ajustes do Android para o
  app" e a seta ([Notificações](04-notificacoes.md#os-ajustes-do-android)); e, só no celular com
  biometria cadastrada ou com a opção já ligada, a linha Entrar com biometria, com o texto "Pede a
  digital ou o rosto ao abrir o app e depois de 10 minutos fora" e um interruptor
  ([Acesso](01-acesso.md#entrar-com-biometria)).
- [Contas Recorrentes](../01-principal/02-contas-recorrentes.md)
- [Tags](02-tags.md)
- E-mails permitidos, só para o admin ([Acesso](01-acesso.md))

## Entrar com biometria

A opção faz o app pedir a digital ou o rosto ao abrir e ao voltar depois de um tempo fora; o que o
app faz com ela está em [Acesso](01-acesso.md#entrar-com-biometria).

- A linha Entrar com biometria aparece no celular que tem ao menos uma biometria cadastrada (digital
  ou rosto) ou onde a opção já está ligada: quem apagou a biometria do celular com a opção ligada
  continua vendo a linha, para poder desligá-la, e ela some quando a opção desliga. Nos outros
  celulares, a linha não aparece, e a seção Neste celular fica só com as Notificações.
- Ligar o interruptor pede a biometria, ou o PIN do celular, uma vez, e a opção só liga se a pessoa
  passar. Assim ninguém se tranca fora do app: só liga quem viu que consegue abrir. Cancelar o pedido
  deixa a opção desligada, sem aviso.
- Desligar não pede nada.
- A opção vale por celular: fica guardada no próprio celular, não nos dados da família. O outro
  celular da mesma pessoa começa com ela desligada. Limpar os dados do app desliga a opção. Reinstalar
  não garante isso: o backup do Android (`allowBackup`, o padrão do Expo) pode trazer a opção ligada
  de volta numa reinstalação ou num celular novo.
- Se o celular não consegue guardar a opção, o app mostra um aviso de erro e o interruptor fica como
  estava.

## Critérios de aceite

- [ ] Todo membro chega às contas recorrentes e às tags pela aba Configurações.
- [ ] Só o admin vê a entrada dos e-mails permitidos.
- [ ] Sem biometria cadastrada no celular e com a opção desligada, a linha Entrar com biometria não
      aparece, e a seção Neste celular mostra só a linha Notificações.
- [ ] Com a opção ligada e a biometria apagada do celular, a linha Entrar com biometria continua na
      tela, e o interruptor desliga a opção sem pedir a biometria.
- [ ] Com biometria cadastrada, a seção Neste celular mostra a linha Entrar com biometria, com o
      interruptor desligado, e a linha Notificações.
- [ ] Tocar em Notificações abre os ajustes do Android para o app.
- [ ] Ligar o interruptor pede a biometria uma vez e só liga se ela der certo.
- [ ] Cancelar o pedido deixa o interruptor desligado.
- [ ] Desligar o interruptor não pede a biometria.
