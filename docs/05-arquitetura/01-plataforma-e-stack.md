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
- **Expo SDK 58 + React Native 0.88 + TypeScript** no app, com o expo-router e o React Compiler do
  template padrão do SDK.
- **Estilo no Unistyles 3.** O tema do app (papéis de cor do Material 3, claro e escuro, papéis de
  tipografia, espaçamento e raios) troca conforme o celular sem renderizar as telas de novo. O
  Restyle ficou de fora: não tem versão desde março de 2025, e o repositório tem uma issue aberta
  perguntando se ele ainda é mantido.
- **Firebase** como back-end, com o login pelo Google
  ([Acesso](../03-funcionalidades/02-suporte/01-acesso.md)). O app usa o React Native Firebase 27,
  só pela API modular (`getAuth`, `getFirestore`, `getStorage`), e as regras de segurança ficam em
  `firebase/`, na raiz. Para testar sem tocar no projeto real, os emuladores do Firebase rodam no
  container da IA, com o Java emprestado do PC de quem desenvolve.
- **Os comprovantes ficam no Cloud Storage**, o serviço de arquivos do Firebase, e os dados no
  Firestore. Cada arquivo tem um registro numa coleção própria, que reúne todos os arquivos do app.
  As regras do Cloud Storage conferem o tipo e o tamanho de cada arquivo: imagem ou PDF, de até 5 MB.
- **Imagens reduzidas com o `expo-image-manipulator`**, do próprio Expo, no celular e antes do
  envio ([Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md#formatos-e-tamanho)).
  As regras do Cloud Storage aplicam o limite de 5 MB do mesmo jeito, sem saber se houve redução.
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
- **PDFs mostrados com a `react-native-pdf`**, dentro do app, com zoom e rolagem entre as páginas
  ([Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md)). É a biblioteca de PDF
  mais usada no React Native. Ela embute o PDFium, um motor de PDF, que pesa cerca de 5 MB no APK, e
  pede o `react-native-blob-util`, que baixa o arquivo quando ele vem de um endereço. Os config
  plugins que a documentação dela indica ficam de fora: o do `blob-util` só prepara o gerenciador de
  downloads do Android, que o app não usa, e o dela só põe no APK uma cópia da `libc++_shared.so`,
  o que o `expo-build-properties` já faz.
- **Arquivos compartilhados recebidos com o `expo-sharing`**, do próprio Expo, que sai junto com
  o SDK ([Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md#compartilhar-pelo-android)).
  O plugin dele põe no manifesto o filtro que faz o app aparecer entre os destinos de uma imagem ou
  de um PDF, e o `+native-intent` do expo-router leva o arquivo recebido à lista das contas a pagar.
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

Ficaram de fora:

- **React Native Paper:** segue o Material 3 padrão, e a direção visual do app se afasta dele em
  vários componentes, como a alternância e o botão flutuante. Usá-la obrigaria a sobrescrever o
  estilo de cada um. Em outubro de 2026, a versão 6 estava em alpha e refazia o campo de texto e o
  botão flutuante, os mais usados no app.
- **Expo UI**, os componentes nativos do Jetpack Compose: estável desde o SDK 56, mas a cor da
  marca é passada componente a componente, sem um tema próprio global, e o layout dentro dele segue
  as regras do Compose, não as do React Native.
- **Material Symbols:** no React Native, o pacote oficial só desenha os ícones dentro do Expo UI.
- **`react-native-better-pdf`:** desenha o PDF com o `PdfRenderer` do próprio Android, sem motor
  embutido (cerca de 2 MB contra 5 MB), e gera a imagem de cada página. Mas o código que o
  `nitrogen` 0.37.1 gera para ela não compila no Kotlin 2.4, que o React Native Firebase 27 pede: o
  Kotlin 2.4 transformou em erro um teste de tipo que sempre dá falso, e o código gerado faz um. Ela
  volta a ser opção quando sair uma versão gerada por um `nitrogen` que corrija isso.
- **`@kishannareshpal/expo-pdf` e `react-native-pdf-renderer`:** a primeira ainda está na versão
  0.x e também embute o PDFium; a segunda não tem versão nova desde agosto de 2025.
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
- **Calendário próprio:** teria de refazer em JavaScript o que o Android já entrega em português do
  Brasil e com acessibilidade.

## Ponto de atenção: o plano Blaze

Desde 3 de fevereiro de 2026, o Cloud Storage só funciona no plano Blaze, o pago conforme o uso do
Firebase: no plano gratuito, os buckets ficam inacessíveis. O Blaze pede uma conta de faturamento,
mas tem uma faixa de uso sem custo. Num projeto novo, essa faixa é a do Google Cloud, que só vale
para buckets nas regiões `us-central1`, `us-east1` e `us-west1`, então o bucket do app nasce numa
delas. Um alerta de orçamento na conta de faturamento avisa se o uso sair da faixa.
