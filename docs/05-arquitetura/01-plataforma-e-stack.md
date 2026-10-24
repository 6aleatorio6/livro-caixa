# Plataforma e Stack

Esta página registra só o que já foi decidido. O código do app fica em `apps/mobile`.

## Decidido

- **Só app para Android.** Não há versão web nem para iOS
  ([Versão web](../04-escopo-excluido/02-versao-web.md), [iOS](../04-escopo-excluido/05-ios.md)).
- **Só em português do Brasil**, com os valores em reais.
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
  PC de quem desenvolve.
- **Os comprovantes ficam no Cloud Storage**, o serviço de arquivos do Firebase, e os dados no
  Firestore. Cada arquivo tem um registro numa coleção própria, que reúne todos os arquivos do app.
  As regras do Cloud Storage conferem o tipo e o tamanho de cada arquivo: imagem ou PDF, de até 5 MB.
- **Jornadas de teste com o Maestro**, no emulador Android do PC de quem desenvolve, contra os
  emuladores do Firebase ([Jornadas de Teste](02-jornadas-de-teste.md)).
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
- **PDFs mostrados com a `react-native-better-pdf`**, dentro do app, com zoom e rolagem entre as
  páginas ([Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md)). Ela desenha o PDF
  com o `PdfRenderer` do próprio Android, sem um motor de PDF embutido, e roda sobre o Nitro, que o
  app já tem por causa do Unistyles. Também gera a imagem de cada página, que a
  [leitura do valor pelo comprovante](../04-escopo-excluido/07-leitura-do-valor-pelo-comprovante.md)
  vai precisar. O risco é a idade: a versão 1.0.0 saiu em 12 de outubro de 2026, testada com o
  SDK 57, não com o 58.

Ficaram de fora:

- **React Native Paper:** segue o Material 3 padrão, e a direção visual do app se afasta dele em
  vários componentes, como a alternância e o botão flutuante. Usá-la obrigaria a sobrescrever o
  estilo de cada um. Em outubro de 2026, a versão 6 estava em alpha e refazia o campo de texto e o
  botão flutuante, os mais usados no app.
- **Expo UI**, os componentes nativos do Jetpack Compose: estável desde o SDK 56, mas a cor da
  marca é passada componente a componente, sem um tema próprio global, e o layout dentro dele segue
  as regras do Compose, não as do React Native.
- **Material Symbols:** no React Native, o pacote oficial só desenha os ícones dentro do Expo UI.
- **`react-native-pdf`:** a biblioteca de PDF mais usada, mas embute o PDFium, o que dá cerca de
  5 MB contra 2 MB da `react-native-better-pdf`, e pede o `react-native-blob-util` e um config
  plugin. É o plano B se a `react-native-better-pdf` falhar: trocar custa só a tela do comprovante.
- **`@kishannareshpal/expo-pdf` e `react-native-pdf-renderer`:** a primeira ainda está na versão
  0.x e também embute o PDFium; a segunda não tem versão nova desde agosto de 2025.

## O que ainda falta decidir

O app precisa de três coisas cuja forma de fazer fica para a fase de código:

- **receber arquivos compartilhados** por outros apps do Android;
- **comprimir imagens** acima de 5 MB;
- **desenhar o gráfico** do [Início](../03-funcionalidades/01-principal/01-inicio.md).

## Ponto de atenção: o plano Blaze

Desde 3 de fevereiro de 2026, o Cloud Storage só funciona no plano Blaze, o pago conforme o uso do
Firebase: no plano gratuito, os buckets ficam inacessíveis. O Blaze pede uma conta de faturamento,
mas tem uma faixa de uso sem custo. Num projeto novo, essa faixa é a do Google Cloud, que só vale
para buckets nas regiões `us-central1`, `us-east1` e `us-west1`, então o bucket do app nasce numa
delas. Um alerta de orçamento na conta de faturamento avisa se o uso sair da faixa.
