# Migrações de Dados

**Como os dados do Firestore mudam de formato de uma versão do app para a seguinte.** Cada mudança é
uma migração: um arquivo em `firebase/migrations/`, testado no emulador como as regras, que roda uma
vez em produção pelo `pnpm migrate`.

## A versão do banco

- O documento `settings/app` guarda no campo `version` a versão do app que os dados exigem, como
  `"0.5.0"`. O app abaixo dela mostra só a tela de atualização
  ([Versão mínima](../03-funcionalidades/02-suporte/01-acesso.md#versão-mínima)).
- Só as migrações gravam o `version`. Mudá-lo à mão, pelo console, faz a migração seguinte recusar o
  banco.
- Cada versão do app tem no máximo uma migração, com o nome da versão: `0.5.0.mjs`. Uma versão que
  não muda nenhum dado não tem migração, e o `version` fica onde estava. Uma versão que precisa
  travar os apps antigos sem mudar dado ganha uma migração sem escritas.
- O campo antigo, o `minVersion`, é o que os apps anteriores às migrações leem. Toda migração o grava
  com o mesmo valor do `version`, e assim a primeira já os trava ([Débito Técnico](05-debito-tecnico.md)).

## O init

- Não tem versão: é o `init.mjs`, que roda só num banco sem `version`, à mão e uma vez por banco, pelo
  `pnpm migrate:init`, fora do `pnpm migrate`.
- Grava `version: "0.0.0"`, que não trava nenhum app, e não mexe em mais nada: os dados como estão,
  no [Modelo de Dados](04-modelo-de-dados.md), são o ponto de partida.

## Como as migrações rodam

- **Até a versão do pacote.** O `pnpm migrate` lê a versão no `package.json` da raiz e roda, em
  ordem, cada migração depois da versão do banco até a do pacote. Ele recusa se o `package.json` de
  `apps/mobile`, de onde o APK tira a versão que a trava compara, estiver em outra. Cada uma só roda
  com o banco exatamente na versão da migração anterior, ou em `"0.0.0"` se for a primeira depois do
  `init`. Num banco sem `version`, ou com um que não é uma versão de três números, ele recusa; sem
  `version`, manda rodar o `init`.
- **Uma transação por migração.** A migração lê a versão e os dados e grava as mudanças, o `version`
  e o `minVersion` num commit. Se algo falha, nada dela muda. O Firestore aceita até 10 MiB por commit
  e 270 s por transação; a migração que passar disso é dividida quando acontecer.
- **A migração devolve as escritas.** Ela lê os dados e diz o que gravar, e o `pnpm migrate` mostra
  as escritas e pede confirmação antes do commit.
- **Pela API REST**, com a conta do `firebase login`, como o `pnpm backup`: sem chave de conta de
  serviço.
- **Com backup antes, sempre.** O `pnpm migrate` e o `pnpm migrate:init` rodam o `pnpm backup`
  antes de gravar e param se ele falhar. Sem migração pendente, o `pnpm migrate` não grava nem faz
  backup.
- **Sem volta.** Uma migração errada se corrige com uma migração nova, na versão seguinte. Restaurar o
  backup é à mão, a partir do arquivo dele.

## A publicação de uma versão com migração

1. O APK novo chega à família.
2. Publicar as regras novas. Elas vão antes porque só elas barram o app antigo que ficou aberto: a
   trava de versão só é conferida quando o Início aparece.
3. `pnpm migrate`: o backup, as migrações e o `version` novo, que trava os apps antigos. Na primeira
   vez, antes dele, o `pnpm migrate:init`.
4. A família instala o APK.

## Os testes

Cada migração tem o teste ao lado (`0.5.0.test.mjs`), no `node --test` e contra o emulador do
Firestore, como as [regras](03-testes.md#regras): o teste grava o banco da versão anterior, roda a
migração e confere o banco depois. `pnpm test:migrations` roda todos.

## O que ficou de fora

- **A versão.** É a do app, no `version`. Perderam um número só dos dados, que separaria a versão dos
  dados da trava, e a coleção de migrações aplicadas do `fireway`, que roda as pendentes sem conferir
  a versão exata.
- **O nome.** O `version` substitui o `minVersion`, que só os apps antigos leem. Perderam manter o
  nome `minVersion` e o app ler os dois campos, que deixaria um ramo permanente no app.
- **Uma migração por versão.** Perderam várias migrações numa versão, que precisariam de outra ordem
  além da versão.
- **O init sem versão, à parte.** Perderam o `init` gravar a versão do app que sai com ele, que
  impediria uma migração na mesma versão; rodar dentro do `pnpm migrate`; apagar os dados; e conferir
  o formato dos dados atuais, que repetiria as regras em JavaScript.
- **Uma transação por migração.** Perdeu gravar em lotes, que exige poder retomar a migração do meio.
- **Sem volta, com backup.** Perderam o `down` em cada migração, que dobra o código e no débito
  recriaria o pagamento sem dono, e um `pnpm restore`.
