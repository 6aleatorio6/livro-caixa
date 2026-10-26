# Plataforma e Stack

Esta página registra só o que já foi decidido. O código do app fica em `apps/mobile`.

## Decidido

- **Só app para Android.** Não há versão web nem para iOS
  ([Versão web](../04-escopo-excluido/02-versao-web.md), [iOS](../04-escopo-excluido/05-ios.md)).
- **Só em português do Brasil**, com os valores em reais.
- **Valores em dinheiro guardados em centavos, como números inteiros:** R$ 12,34 é guardado como
  `1234`, e só a tela mostra o valor em reais. Somar números com casas decimais acumula erro de
  arredondamento (no JavaScript, 0,1 + 0,2 dá 0,30000000000000004); com inteiros, as somas do mês
  fecham no centavo.
- **Instalado por APK**, direto nos celulares da família, fora da Play Store
  ([Publicação na Play Store](../04-escopo-excluido/06-publicacao-na-play-store.md)).
  O APK de release assina com uma chave própria, guardada fora do Git com a senha no `.env` do app, e
  não com a chave de debug do modelo do Expo, que é a mesma em todo projeto e deixaria qualquer um
  gerar um APK que o celular aceitaria como atualização. O login pelo Google confere a impressão
  SHA-1 dessa chave, cadastrada no app Android do Firebase. Perder a chave impede atualizar o app
  instalado: só desinstalando e instalando de novo.
- **Expo SDK 58 + React Native 0.88 + TypeScript** no app, com o expo-router e o React Compiler do
  template padrão do SDK.
- **Estilo no Unistyles 3.** O tema do app (papéis de cor do Material 3, claro e escuro, papéis de
  tipografia, espaçamento e raios) troca conforme o celular sem renderizar as telas de novo. O
  Restyle ficou de fora: não tem versão desde março de 2025, e o repositório tem uma issue aberta
  perguntando se ele ainda é mantido.
- **Firebase** como back-end, com o login pelo Google
  ([Acesso](../03-funcionalidades/02-suporte/01-acesso.md)). O app usa o React Native Firebase 27,
  só pela API modular (`getAuth`, `getFirestore`), e as regras de segurança ficam em
  `firebase/`, na raiz. Para testar sem tocar no projeto real, os emuladores do Firebase rodam no
  container da IA, com o Java emprestado do PC de quem desenvolve.
- **Os comprovantes ficam no próprio Firestore**, sem o Cloud Storage. Desde 3 de fevereiro de
  2026, o Cloud Storage só funciona no plano Blaze, o pago conforme o uso, e ativá-lo pedia um
  pagamento antecipado; o Firestore funciona no plano gratuito. Cada comprovante tem dois documentos
  com o mesmo id: o registro, em `files`, que os detalhes leem em tempo real, e os bytes, em
  `fileContents`, que só o visualizador lê, uma vez. Os dois entram e saem no mesmo lote do
  lançamento, então não sobra arquivo sem lançamento nem lançamento sem arquivo. Um documento tem no
  máximo 1 MiB, e o comprovante fica em até 900 KB (921.600 bytes), com o resto de folga. As regras
  do Firestore conferem o autor, o tipo (só imagem) e que o tamanho dos bytes é o do registro.
- **Imagens comprimidas com o `expo-image-manipulator`**, do próprio Expo, no celular e antes de
  salvar ([Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md#formatos-e-tamanho)).
  A imagem acima de 900 KB desce uma escada: primeiro a qualidade, depois o lado maior, até um piso
  de 1600 px com qualidade 0,5, que ainda deixa ler uma nota. O que não cabe nem no piso é recusado.
- **PDF de uma página convertido em imagem com a `@dariyd/react-native-pdf-page-image`**, antes de
  salvar. Ela desenha a página com o `PdfRenderer` do próprio Android, sem motor embutido, e diz
  quantas páginas o PDF tem, o que serve para recusar o de mais de uma. É um módulo nativo em Kotlin
  escrito à mão, sem código gerado, então compila com o Kotlin 2.4. A página sai com o lado maior em
  2560 px e passa pela mesma escada das fotos. Defeitos: ela trabalha na thread do módulo e não
  captura falta de memória, o que o lado maior de 2560 px limita a uns 37 MB de bitmap.
- **Jornadas de teste com o Maestro**, no emulador Android do PC de quem desenvolve, contra os
  emuladores do Firebase ([Jornadas de Teste](02-jornadas-de-teste.md)).
- **Testes de página com mocks conferidos por testes de contrato:** o teste de página mocka a
  leitura em tempo real e os serviços só com cenários que o teste de contrato roda contra os
  emuladores do Firebase ([Testes](03-testes.md)).
- **Um projeto novo**, criado com o template do SDK 58. A estrutura, as fábricas e os componentes
  base partem de um app anterior da casa, reescritos no padrão atual de cada biblioteca.
- **Componentes próprios**, escritos sobre os do React Native, sem biblioteca de componentes. Cada
  componente desenhado no arquivo de design é a especificação do componente no app, com todos os
  estados. O tema do app usa as variáveis do design: os papéis de cor do Material 3, nos temas claro
  e escuro, e uma fonte por papel de tipografia. A acessibilidade de cada controle (papel, rótulo e
  estado) fica por conta do código.
- **Só ícones do Lucide**, no protótipo e no app: nenhum outro pacote de ícones entra. O arquivo de
  design usa os ícones do Lucide, e o app usa o `lucide-react-native`. O Lucide só tem ícones de
  traço, sem versão preenchida: o item ativo da navegação se destaca pela cor e pelo fundo, não por
  um ícone cheio. O ícone do app e as ilustrações não são ícones de pacote: são desenhados para a
  marca.
- **Zoom da imagem do comprovante escrito à mão, com o `react-native-gesture-handler` 3 e a
  Reanimated 4**, que o app já tem ([Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md)).
  A pinça aproxima de 1× a 4×, dois toques alternam 1× e 2×, e só com zoom a imagem se arrasta; são
  umas 40 linhas de gestos. O app tem a raiz dos gestos (`GestureHandlerRootView`) no `AppContainer`.
- **A folha de baixo dos detalhes do lançamento é uma rota em modal transparente do expo-router**,
  e não um componente dentro de cada lista: o "Ver" (o comprovante em tela cheia) e o "Alterar"
  empilham por cima da folha e voltam para ela, e as duas listas só fazem a navegação. A
  `@gorhom/bottom-sheet` seria uma dependência nova, e o `formSheet` do `react-native-screens`, que
  tem implementação no Android, não foi experimentado.
- **Arquivos compartilhados recebidos com o `expo-sharing`**, do próprio Expo, que sai junto com
  o SDK ([Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md#compartilhar-pelo-android)).
  O plugin dele põe no manifesto o filtro que faz o app aparecer entre os destinos de uma imagem ou
  de um PDF, e o `+native-intent` do expo-router leva o endereço `livrocaixa://expo-sharing`, com que
  o Android abre o app, à rota `share-receipt`. O `useIncomingShare` lê o arquivo, que o módulo já
  copia para o cache, e o `prepareReceipt` o confere como em qualquer comprovante.
  O risco: no SDK 58, o recebimento ainda é experimental.
- **Seletor de arquivos com o `expo-document-picker`**, do próprio Expo, que sai junto com o SDK.
  Abre o seletor de documentos do Android para escolher o comprovante e não pede plugin.
- **Calendário do Android, com a `@react-native-community/datetimepicker`.** A família já conhece o
  calendário do Android, que vem em português do Brasil e acessível. O plugin dela pinta o calendário
  com as cores do tema claro e escuro do design.
- **Gráfico do Início desenhado no próprio app, com o `react-native-svg`**
  ([Início](../03-funcionalidades/01-principal/01-inicio.md)). O `react-native-svg` o app já tem,
  sem pacote nativo novo. O anel do que falta pagar são dois círculos: o trilho inteiro e, por cima,
  o arco do que foi pago, com as pontas redondas e o valor no centro. As barras por tag e por membro
  são componentes simples, porque nenhum gráfico de barras compensa os eixos que o design não tem.
- **Campo com foco acima do teclado, com a `react-native-keyboard-controller`.** O
  `KeyboardProvider` fica na raiz, no `AppContainer`, e o `ScreenContent` rola com o
  `KeyboardAwareScrollView` dela: o campo com foco sobe e deixa um vão entre o cursor e o teclado,
  para a mensagem de erro do campo continuar visível. É uma biblioteca nativa, sem config plugin: a
  instalação pede um APK novo.

Ficaram de fora:

- **React Native Paper:** segue o Material 3 padrão, e a direção visual do app se afasta dele em
  vários componentes, como a alternância e o botão flutuante. Usá-la obrigaria a sobrescrever o
  estilo de cada um. Em outubro de 2026, a versão 6 estava em alpha e refazia o campo de texto e o
  botão flutuante, os mais usados no app.
- **Expo UI**, os componentes nativos do Jetpack Compose: estável desde o SDK 56, mas a cor da
  marca é passada componente a componente, sem um tema próprio global, e o layout dentro dele segue
  as regras do Compose, não as do React Native.
- **Material Symbols:** no React Native, o pacote oficial só desenha os ícones dentro do Expo UI.
- **Bibliotecas de zoom de imagem:** o `maximumZoomScale` do `ScrollView` é só do iOS; a
  `react-native-zoom-toolkit` não foi testada com o `react-native-gesture-handler` 3; e a
  `@likashefqet/react-native-image-zoom` está parada desde 2024.
- **Cloud Storage no plano Blaze:** guarda arquivos de qualquer tamanho, mas pede uma conta de
  faturamento, e a ativação pedia um pagamento antecipado.
- **Cloudinary:** sem um servidor, o celular só envia por um *preset* sem assinatura, que qualquer
  um que abra o APK pode usar; a leitura privada e a exclusão pedem uma chave secreta, que não pode
  ficar no app. A função que assinaria os pedidos, se fosse uma Cloud Function, também pediria o
  Blaze.
- **`react-native-pdf`:** mostrava o PDF dentro do app, com zoom e rolagem entre as páginas. Saiu
  porque nenhum comprovante novo é PDF, e com ela saem o PDFium (cerca de 5 MB no APK) e o
  `react-native-blob-util`.
- **`react-native-better-pdf`:** desenha o PDF com o `PdfRenderer` do próprio Android e gera a
  imagem de cada página. Mas o código que o `nitrogen` 0.37.1 gera para ela não compila no Kotlin
  2.4, que o React Native Firebase 27 pede: o Kotlin 2.4 transformou em erro um teste de tipo que
  sempre dá falso, e o código gerado faz um. A versão 1.1.0 ainda é a que falha.
- **`react-native-pdf-thumbnail`, `expo-pdf-to-image` e `react-native-pdf-to-image`:** geram a
  página com 1 pixel por ponto do PDF, então uma folha A4 vira 595 × 842 px, ilegível no zoom.
- **`@kishannareshpal/expo-pdf` e `react-native-pdf-renderer`:** a primeira ainda está na versão
  0.x e embute o PDFium; a segunda não tem versão nova desde agosto de 2025.
- **`expo-share-intent`:** recebe compartilhamentos com um hook, mas é da comunidade e não tem
  versão confirmada para o SDK 58; o `expo-sharing` faz o mesmo e é atualizado junto com o SDK.
- **`react-native-gifted-charts`:** desenha com o `react-native-svg`, mas o import da raiz lança
  "Gradient package was not found" sem o `react-native-linear-gradient` ou o `expo-linear-gradient`,
  os dois nativos, o que pediria outro build nativo. O miolo do anel é um círculo pintado por cima,
  que não acompanha o tema claro e escuro, e o arco não tem pontas redondas.
- **`victory-native`:** mantida e completa, mas desenha com o Skia, um pacote nativo de vários MB,
  para um anel e algumas barras. Só compensaria num gráfico interativo ou com muitos pontos.
- **`react-native-chart-kit`:** também desenha com o `react-native-svg` e tem um gráfico em anel,
  mas é a que menos deixa ajustar o estilo ao design.
- **`@react-native-documents/picker`:** faz o mesmo que o `expo-document-picker`, mas é uma
  biblioteca à parte, sem a garantia de sair junto com o SDK.
- **`KeyboardAvoidingView` e `ScrollView` do React Native:** no Android com edge-to-edge a janela
  não é redimensionada quando o teclado abre, então nada se move e o campo com foco fica atrás
  dele.
- **Calendário próprio:** teria de refazer em JavaScript o que o Android já entrega em português do
  Brasil e com acessibilidade.

## Ponto de atenção: o espaço do plano gratuito

O plano gratuito do Firestore guarda até 1 GiB, e os comprovantes ocupam quase todo ele: com 900 KB
cada, no pior caso, cabem uns mil; comprimidos para uns 300 KB, uns três mil. Os 50 mil documentos
lidos por dia não preocupam, porque a lista do mês lê só o registro, e os bytes só são lidos quando
alguém abre o comprovante. Quando o espaço apertar, as saídas são apagar os comprovantes antigos ou
passar ao plano Blaze, com o Cloud Storage.
