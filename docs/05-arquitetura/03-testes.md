# Testes

**Cada comportamento é testado na camada mais barata que o prova, e o mock de um teste de página só
devolve o que um teste de contrato já viu o serviço real devolver.** O teste de página roda em
segundos, sem o Firebase, e mesmo assim não inventa o que o Firebase responde.

Esta página mostra as camadas, os cenários que ligam o mock ao serviço real e o que nenhum teste
automatizado cobre. Como a IA usa o app no emulador do Android está em
[Jornadas de Teste](02-jornadas-de-teste.md).

## Onde testar

O comportamento vai para a primeira camada desta lista que consegue prová-lo, da mais barata para a
mais cara:

- **O que o código do app decide sozinho → [Unidade](#unidade).** Ex.: com o e-mail só no cache
  do celular, o app espera o servidor em vez de mandar a pessoa para a tela de sem acesso.
- **O que a pessoa vê e faz numa tela → [Página](#página).** Ex.: quem entra com um e-mail fora da
  lista vê o aviso com o próprio e-mail, e "Sair" a leva de volta ao login.
- **O que um serviço lê ou grava no Firebase, com as regras de segurança → [Contrato](#contrato).**
  Ex.: com a leitura aberta, tirar o e-mail da lista faz o serviço entregar `false`.
- **O que nenhum serviço do app faz, mas alguém com uma conta poderia tentar → [Regras](#regras).**
  Ex.: um membro gravando na lista de e-mails permitidos.

As jornadas ficam fora da lista: elas acham o bug, e o teste fica numa destas camadas
([Jornadas](#jornadas)).

## Unidade

Testa uma função, um hook ou um componente pelo que ele decide sozinho, com o Jest e a React Native
Testing Library. Não fala com o Firebase.

- **Uma função pura** ganha um caso por ramo. Ex.: o `accessStatusFor`, que escolhe entre login, sem
  acesso e o app.
- **O código que embrulha o Firebase** (`subscribeToRefs`, `useRealtime`, `useAuthState`) recebe
  snapshots montados no teste, porque o que se testa é a lógica dele: esperar todas as leituras
  responderem, marcar o dado que veio do cache, parar tudo num erro.
- **Um componente** ganha o que a pessoa faz nele e as props que mudam o que aparece.

## Página

Desenha a tela, ou o layout com as rotas, e confere o que a pessoa vê e o que acontece quando ela
toca. O `useRealtime` e os serviços são mockados, e todo valor que um mock devolve vem de um
[cenário](#os-cenários).

- **A leitura em tempo real** devolve o resultado de um cenário, ou um estado sem dado, como
  "carregando". Se a tela pedir a leitura com outro parâmetro que não o do cenário, o teste falha e
  diz qual leitura e qual parâmetro. Ex.: a tela que lê a lista com o e-mail de outra pessoa.
- **A chamada a um serviço** devolve o resultado do cenário, e o teste confere que a tela chamou o
  serviço com a entrada do cenário. Ex.: "Sair" chama a saída.
- **A mudança com a tela aberta** vem do mesmo cenário, que diz o que muda no banco e o que a leitura
  entrega depois. Ex.: Bruno está no Início, o admin tira o e-mail dele, e o app vai para a tela de
  sem acesso.
- **O login pelo Google é a exceção.** Ele é nativo e não roda no emulador, então o teste da tela de
  login mocka o serviço com valores escritos no próprio teste, e uma pessoa confere o login de
  verdade.

## Contrato

É o equivalente ao teste de endpoint de um back-end: roda o serviço de verdade contra os emuladores
do Firebase, com as regras de segurança, e confere que ele entrega o que os cenários dizem. Uma
rodada leva uns 20 segundos, quase todos para subir os emuladores.

- **Cada cenário vira um caso.** O teste grava os documentos do cenário, entra com a conta dele,
  chama o serviço e compara o resultado. Um cenário novo ganha o seu caso sem ninguém precisar
  lembrar de escrevê-lo.
- **Todos os serviços têm contrato.** Um teste falha quando um serviço fica sem o dele. A exceção é
  o serviço nativo, o login pelo Google, que fica numa lista com o motivo.
- **O SDK JavaScript faz o papel do nativo.** O React Native Firebase só roda no celular, e o modo
  web dele não tem leitura em tempo real. O teste troca o pacote nativo pelo SDK JavaScript do
  Firebase, que tem as mesmas funções: o código do serviço é o mesmo, e só a camada nativa fica de
  fora.
- **O contrato também mostra o que a regra deixa.** Ex.: Carla, fora da lista, lê o documento do
  próprio e-mail, que não existe, e recebe `false`, e não um erro de permissão.
- **Roda ao lado das jornadas.** O contrato sobe emuladores só dele, em outras portas, e por isso
  roda com a pilha das jornadas no ar sem tocar nas contas e nos dados delas. Dividir os emuladores
  das jornadas não dá: o login do Firebase não diz a qual projeto pertence, e o emulador guardaria as
  contas do contrato junto com as das jornadas.

## Regras

Testa as regras de segurança do Firestore sozinhas, contra o emulador, no que o contrato não alcança:
o que nenhum serviço do app faz, mas alguém com uma conta poderia tentar direto pelo SDK. Ex.: ler o
documento do e-mail de outra pessoa, ou gravar na lista.

## Os cenários

Um cenário é um caso de um serviço, escrito uma vez e usado pelas duas camadas: o contrato o confere
contra os emuladores, e o teste de página o usa como mock. Fica ao lado do serviço, em
`<serviço>.scenarios.ts`, e diz:

- **Quem chama:** a conta de teste, ou ninguém com sessão.
- **O banco antes:** os documentos, cada um pelo caminho.
- **A entrada:** os parâmetros da leitura, ou o que o serviço recebe.
- **O resultado:** o que o serviço entrega. Num objeto, só os campos que alguma tela usa.
- **A mudança**, só numa leitura em tempo real: o que muda no banco com a leitura aberta e o que ela
  entrega depois.

Ex.: no cenário "e-mail fora da lista", Carla está com sessão, a lista tem só o e-mail do Bruno, a
leitura pede o e-mail dela, e o resultado é `false`.

O cenário cumpre duas regras. Para cada valor que um mock devolve, o contrato mostra o serviço real
devolvendo o mesmo valor. Para cada chamada que a página faz, o contrato chama o serviço com a mesma
entrada.

**Para mockar um caso que ainda não existe**, como um mês sem lançamentos, o cenário novo entra
primeiro, e o contrato o roda antes de o teste de página usá-lo.

## Jornadas

As jornadas são quem desenvolve testando o app à mão, no emulador do Android: servem para achar e
analisar bugs e ver o estado do app ([Jornadas de Teste](02-jornadas-de-teste.md)). São redundantes
por definição, porque cada verificação de uma jornada também tem um teste numa das camadas acima.

- **Um bug que a jornada acha** vira primeiro um teste que falha, na camada mais barata que o
  reproduz, e só depois é corrigido.
- **Uma verificação de jornada sem teste mais barato** é um teste que falta, e não um motivo para a
  jornada existir.

## Como roda

Tudo roda no container da IA. O Java dos emuladores do Firebase vem do PC de quem desenvolve. O
contrato e as regras sobem os próprios emuladores a cada rodada, com a configuração de
`firebase/firebase.test.json`, e não rodam ao mesmo tempo, porque dividem essas portas.

| Camada | Comando |
|---|---|
| Unidade e página | `pnpm test:mobile` |
| Contrato | `pnpm test:contract` |
| Regras | `pnpm test:rules` |

O contrato e as regras rodam a cada mudança num serviço, num cenário ou numa regra, como o teste de
endpoint roda a cada mudança na api.

## O que nenhum teste automatizado garante

Da lacuna mais grave para a mais leve:

- **O índice composto.** O emulador roda qualquer consulta válida, e o Firestore de verdade recusa
  a consulta que combina filtro e ordem sem o índice declarado. Por isso, o índice é declarado em
  `firebase/` junto com a consulta.
  *Alta: a tela fica sem dados no celular da família, e nenhum teste falha antes. Ainda não
  aconteceu, porque o app ainda não tem consulta assim.*
- **O SDK nativo.** O contrato roda o SDK JavaScript. O cache do celular, o momento em que ele
  marca um dado como vindo do cache e o formato do código de erro são do nativo: no celular, o erro
  vem como `firestore/permission-denied`, e no SDK JavaScript, como `permission-denied`.
  *Média: é o que as jornadas exploram, e o bug achado vira um teste de unidade com o snapshot que o
  nativo entregou.*
- **O login pelo Google de verdade.** O emulador aceita uma conta inventada, e o seletor de contas
  e o token do Google só uma pessoa confere.
  *Baixa: só muda quando a biblioteca de login do Google muda.*

## Referências

- J. B. Rainsberger,
  [Who tests the contract tests?](https://blog.thecodewhisperer.com/permalink/who-tests-the-contract-tests)
  — base de [Os cenários](#os-cenários): para cada valor que um mock devolve, um contrato com esse
  valor como resultado; para cada chamada que um teste espera, um contrato que chama o serviço com
  essa entrada.
- Martin Fowler, [ContractTest](https://martinfowler.com/bliki/ContractTest.html) — base de
  [Contrato](#contrato): o contrato confere que o mock responde como o serviço. Fowler o roda no
  ritmo do serviço de terceiros, uma vez por dia; aqui o serviço e as regras são do app, então o
  contrato roda a cada mudança deles.
- Google Cloud, [Use Firestore emulator locally](https://docs.cloud.google.com/firestore/docs/emulator)
  — base de [O índice composto](#o-que-nenhum-teste-automatizado-garante): "the emulator does not
  track composite indexes and instead will execute any valid query".
