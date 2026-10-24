# Jornadas de Teste

**As jornadas são o jeito de a IA usar o app de verdade, num emulador, e guardar o caminho conferido
como teste.** A ferramenta é o Maestro: a IA explora a tela pelo MCP dele e, o que confere e vale
repetir, vira um fluxo que roda de novo quando precisar. Elas começam com o código do app.

## Onde rodam

- **O emulador Android roda no PC de quem desenvolve.** O container em que a IA trabalha não roda
  um emulador, porque não tem aceleração de hardware.
- **O emulador é um Android 15**, com a imagem de testes do Google (`google_atd`), a mais leve que
  traz os serviços do Google que o app usa. No Android 16, a splash do app deixa a janela presa
  numa animação que nunca termina, e cada toque das jornadas passa a levar 10 s em vez de 2; no
  Android 15 isso não acontece. Quem usa o app não percebe, porque um toque de verdade não espera a
  animação.
- **Todo o resto roda no container:** o Maestro, os emuladores do Firebase (Auth, Firestore e
  Storage) e o Metro. O container divide a rede com o PC, então o Maestro fala com o emulador pelo
  adb do próprio PC, e o app chega aos emuladores do Firebase e ao Metro pelo endereço do PC. O
  Java, o Maestro e o adb são os do PC, emprestados ao container.
- **Contra os emuladores do Firebase**, com dados de teste, e não contra o projeto real. O app de
  teste é o build de debug, com o Metro servindo o código apontado para os emuladores.
- **Cada fluxo começa do mesmo ponto:** apaga os dados do Firestore do emulador e grava a lista de
  e-mails permitidos das contas de teste.
- **Os fluxos rodam um depois do outro.** Cada um apaga o Firestore inteiro, e o app é uma família
  por banco: dois ao mesmo tempo apagariam os dados um do outro.

## Como a IA entra numa conta

**A jornada entra por um link, `livrocaixa://test-sign-in?email=…&name=…`, com uma conta Google
inventada.** No lugar do token do Google, o app manda ao emulador do Auth um JSON com a identidade
(`sub`, `email`, `email_verified` e `name`), que ele aceita sem uma conta de verdade. O provedor
continua sendo o Google, como no login real, então as regras de acesso valem do mesmo jeito.

- **O link só funciona com o app nos emuladores.** No APK da família, ele volta para o login sem
  entrar.
- **Uma conta por perfil**, com dados de exemplo:
  - Ana Souza, `ana.souza@exemplo.com`: admin;
  - Bruno Souza, `bruno.souza@exemplo.com`: membro;
  - Carla Lima, `carla.lima@exemplo.com`: fora da lista de e-mails permitidos.
- **O nome que o app mostra vem da lista de e-mails permitidos**, e o começo de cada fluxo grava as
  contas com o nome, como o admin faria. O JSON também leva o nome, que o emulador grava na conta,
  como o Google faz.
- **O login real pelo Google fica para uma pessoa conferir**, porque o emulador não o reproduz.

## O compartilhamento de comprovantes

O Maestro comanda o aparelho inteiro, não só o app. A jornada pode fazer o que a família faz: abrir
outro app, compartilhar uma imagem ou um PDF e escolher o Livro-Caixa
([Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md)).

> 🔴 **A validar:** se a jornada chega à tela de compartilhar pelo app de arquivos do Android ou por
> um comando do adb que abre o app já com o arquivo.
