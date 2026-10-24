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

O APK de teste tem uma entrada que só existe nele: a credencial do Google é montada com um JSON
(`sub`, `email`, `email_verified`), que o emulador do Auth aceita sem uma conta Google de verdade.
O provedor continua sendo o Google, como no APK da família, então as regras de acesso valem do mesmo
jeito.

- **Uma conta por perfil:** o admin, um membro e um e-mail fora da lista de e-mails permitidos.
- **Essa entrada nunca vai para o APK da família.**
- **O login real pelo Google fica para uma pessoa conferir**, porque o emulador não o reproduz.

> 🔴 **A validar:** se o JSON leva também o nome da pessoa. O lançamento guarda o nome de quem pagou,
> conferido contra o login, e sem nome no JSON essa conferência muda.

## O compartilhamento de comprovantes

O Maestro comanda o aparelho inteiro, não só o app. A jornada pode fazer o que a família faz: abrir
outro app, compartilhar uma imagem ou um PDF e escolher o Livro-Caixa
([Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md)).

> 🔴 **A validar:** se a jornada chega à tela de compartilhar pelo app de arquivos do Android ou por
> um comando do adb que abre o app já com o arquivo.
