# Jornadas de Teste

**As jornadas são o jeito de a IA usar o app de verdade, num emulador, e guardar o caminho conferido
como teste.** A ferramenta é o Maestro: a IA explora a tela pelo MCP dele e, o que confere e vale
repetir, vira um fluxo que roda de novo quando precisar. Elas começam com o código do app.

## Onde rodam

- **No emulador Android do PC de quem desenvolve.** O container em que a IA trabalha não roda um
  emulador, porque não tem aceleração de hardware.
- **Contra os emuladores do Firebase** (Auth, Firestore e Storage), com dados de teste, e não contra
  o projeto real. O APK de teste aponta para eles.

> 🔴 **A validar:** como o Maestro alcança o emulador do PC: por um túnel para o adb do PC, ou com o
> MCP do Maestro rodando no próprio PC, por SSH.

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
