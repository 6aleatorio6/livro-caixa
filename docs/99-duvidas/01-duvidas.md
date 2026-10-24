# Dúvidas e Pontos em Aberto

Registro das **dúvidas e questões em aberto** que ainda precisam de definição ou validação antes
de entrar na documentação. Cada item traz o que se sabe até aqui, o que falta esclarecer e onde o
tema aparece na documentação.

| ID | Dúvida | Status |
| --- | --- | --- |
| D-01 | Como a família controla as contas hoje, e o que dá errado? | 🟢 Encerrada — não será respondida |
| D-02 | O app é só para Android ou também para iOS? | 🟢 Respondido — só Android |
| D-03 | Quais são os dados de uma conta recorrente: valor, vencimento, início e fim? | 🟢 Respondido — nome, valor previsto, dia do mês, início e tag opcional, sem fim |
| D-04 | Quem cadastra, altera e exclui contas recorrentes, e o que acontece com os meses já pagos? | 🟢 Respondido — qualquer membro; os meses pagos não mudam |
| D-05 | Em que mês um lançamento conta? | 🟢 Respondido — o pagamento no mês da conta; a conta avulsa no mês da data dela |
| D-06 | Uma conta recorrente pode ter mais de um pagamento no mesmo mês? | 🟢 Respondido — não: o mês fica com o primeiro que pagar |
| D-07 | O que é o processamento de imagens acima de 5 MB, e o que acontece com um PDF grande? | 🟢 Respondido — a imagem acima de 2 MB é reduzida antes de salvar; o PDF acima de 5 MB é recusado |
| D-08 | O que o app mostra depois de receber um arquivo compartilhado pelo Android? | 🟢 Respondido — a lista das contas a pagar do mês, com "Conta avulsa" por último |
| D-09 | De onde o membro anexa o comprovante dentro do app? | 🟢 Respondido — só dos arquivos do celular |
| D-10 | O que o Início mostra, além do gráfico do mês? | 🟢 Respondido — lista do mês, separação por tag e por membro, meses anteriores |
| D-11 | Quem pode alterar ou excluir um pagamento ou uma conta avulsa? | 🟢 Respondido — só quem registrou |
| D-12 | Quais são os campos de uma conta avulsa, e a tag é obrigatória? | 🟢 Respondido — nome, valor, data e comprovante; tag opcional |
| D-13 | Uma tag pode ser alterada ou excluída? | 🟢 Respondido — qualquer membro altera; só se exclui sem uso; nome único |
| D-14 | Como funciona a saída de um membro da lista de e-mails permitidos? | 🟢 Respondido — só sai quem não tem lançamento; um admin, sem verificação |
| D-15 | O app é só em português e só em reais? | 🟢 Respondido — sim |
| D-16 | Um mês que passou sem pagamento continua a pagar? | 🟢 Respondido — sim, só no próprio mês |
| D-17 | Onde o easter egg do "Paia" aparece no app? | 🟢 Respondido — na arte da splash screen |
| D-18 | Como o Maestro alcança o emulador do PC? | 🟢 Respondido — pela rede do PC, que o container divide |
| D-19 | O JSON do Google falso leva o nome da pessoa? | 🟢 Respondido — sim, no campo `name` |
| D-20 | Como a jornada do compartilhamento chega à tela de compartilhar? | 🔴 Em aberto |
| D-21 | Como se chama a aba do meio, e ela mostra o mês ou todos os meses? | 🟢 Respondido — Meus pagamentos, um mês por vez, com a troca de mês |
| D-22 | O app lê o valor no comprovante? | 🟢 Respondido — fica para depois, com a leitura no celular |
| D-23 | O comprovante em PDF abre dentro do app ou no leitor do celular? | 🟢 Respondido — dentro do app, como a imagem |

<!-- Status: 🔴 Em aberto · 🟡 Parcial — o que falta · 🟢 Respondido — a resposta -->

## D-01 — O problema de hoje

**Dúvida:** como a família controla as contas hoje (planilha, conversa, nada) e o que dá errado
nesse controle.

**Resposta:** não será respondida. A página de contexto descreve o cenário e a solução, sem uma
seção sobre o problema.

**Onde aparece:** [Contexto](../01-visao-geral/01-contexto.md).

## D-02 — Android, iOS ou os dois

**Resposta:** só Android. O iOS entrou no escopo excluído.

**Onde aparece:** [Plataforma e Stack](../05-arquitetura/01-plataforma-e-stack.md),
[iOS](../04-escopo-excluido/05-ios.md).

## D-03 — Os dados de uma conta recorrente

**Resposta:** segue o modelo das despesas recorrentes do projeto-c. A conta tem nome, valor
previsto, dia do mês (de 1 a 31, no último dia nos meses mais curtos), a data a partir da qual vale
e a tag, que é opcional. Não tem fim: vale até ser excluída. Quem paga confirma ou corrige o valor
previsto.

**Onde aparece:** [Contas Recorrentes](../03-funcionalidades/01-principal/02-contas-recorrentes.md),
[Pagamento de Conta Recorrente](../03-funcionalidades/01-principal/03-pagamento-de-conta-recorrente.md).

## D-04 — Alterar e excluir uma conta recorrente

**Resposta:** qualquer membro cadastra, altera e exclui. Alterar muda os meses ainda sem
pagamento, passados ou futuros; excluir tira esses meses e mantém os pagamentos já feitos (modelo
do projeto-c). "Qualquer membro pode definir" foi lido como cadastrar, alterar e excluir.

**Onde aparece:** [Contas Recorrentes](../03-funcionalidades/01-principal/02-contas-recorrentes.md),
[Público e Perfis](../01-visao-geral/03-publico-e-perfis.md).

## D-05 — O mês de um lançamento

**Resposta:** o pagamento de uma conta recorrente conta no mês da conta que ele paga. A conta
avulsa entra no mês da data dela, que vem preenchida com a data de hoje e pode ser trocada.

**Onde aparece:** [Início](../03-funcionalidades/01-principal/01-inicio.md),
[Conta Avulsa](../03-funcionalidades/01-principal/04-conta-avulsa.md).

## D-06 — Mais de um pagamento no mês

**Resposta:** não. O mês da conta fica com o primeiro membro que pagar, e um segundo pagamento é
recusado (modelo do projeto-c).

**Onde aparece:** [Pagamento de Conta Recorrente](../03-funcionalidades/01-principal/03-pagamento-de-conta-recorrente.md).

## D-07 — Imagens e PDFs grandes

**Resposta:** uma imagem acima de 2 MB é reduzida no app antes de salvar: o lado maior cai para
2560 pixels, e ela é salva em WebP. Um PDF acima de 5 MB é recusado. Antes, só a imagem acima de
5 MB era comprimida, até ficar abaixo do limite; o corte caiu para 2 MB para que a foto comum
também suba numa fração do tamanho.

**Onde aparece:** [Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md).

## D-08 — Depois de compartilhar pelo Android

**Resposta:** o app abre a lista das contas a pagar do mês, com o comprovante anexado. O membro
escolhe a conta que está pagando; a última opção da lista é "Conta avulsa". Quem não está logado
faz o login e precisa compartilhar o arquivo de novo.

**Onde aparece:** [Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md).

## D-09 — Anexar de dentro do app

**Resposta:** só dos arquivos do celular, uma imagem ou um PDF. Sem câmera e sem galeria.

**Onde aparece:** [Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md).

## D-10 — O que o Início mostra

**Resposta:** além do gráfico do mês, a lista dos lançamentos e das contas a pagar do mês, a
separação por tag e por membro, e a troca para os meses anteriores. O formato do gráfico fica para
o design.

**Onde aparece:** [Início](../03-funcionalidades/01-principal/01-inicio.md).

## D-11 — Alterar ou excluir um lançamento

**Resposta:** só quem registrou o lançamento pode alterá-lo ou excluí-lo.

**Onde aparece:** [Pagamento de Conta Recorrente](../03-funcionalidades/01-principal/03-pagamento-de-conta-recorrente.md),
[Conta Avulsa](../03-funcionalidades/01-principal/04-conta-avulsa.md).

## D-12 — Os campos de uma conta avulsa

**Resposta:** nome, valor, data e comprovante. A tag é opcional.

**Onde aparece:** [Conta Avulsa](../03-funcionalidades/01-principal/04-conta-avulsa.md).

## D-13 — Alterar e excluir tags

**Resposta:** qualquer membro cria e altera tags, com um nome e uma cor de uma lista fixa. Uma tag
só é excluída quando nenhuma conta a usa. O nome é único, sem diferença entre
maiúsculas e minúsculas nem entre letras com e sem acento. A tag é opcional na conta recorrente e
na conta avulsa.

**Onde aparece:** [Tags](../03-funcionalidades/02-suporte/02-tags.md).

## D-14 — A saída de um membro e os admins

**Resposta:**

- o admin é marcado à mão no banco de dados e adiciona e remove e-mails da lista;
- um e-mail só sai da lista enquanto a pessoa não tem nenhum lançamento. Depois do primeiro, ela não
  sai mais. "A partir do primeiro gasto" foi lido como o primeiro lançamento, pagamento ou conta
  avulsa;
- quem entra com um e-mail fora da lista fica numa tela simples de sem acesso;
- o esperado é um admin só, mas o app não confere isso.

**Onde aparece:** [Acesso](../03-funcionalidades/02-suporte/01-acesso.md),
[Público e Perfis](../01-visao-geral/03-publico-e-perfis.md).

## D-15 — Idioma e moeda

**Resposta:** só português do Brasil, com os valores em reais.

**Onde aparece:** [Contexto](../01-visao-geral/01-contexto.md),
[Plataforma e Stack](../05-arquitetura/01-plataforma-e-stack.md).

## D-16 — Um mês que passou sem pagamento

**Resposta:** a conta continua a pagar no próprio mês e não aparece no Início do mês seguinte. Cada
mês mostra só as próprias contas.

**Onde aparece:** [Contas Recorrentes](../03-funcionalidades/01-principal/02-contas-recorrentes.md),
[Início](../03-funcionalidades/01-principal/01-inicio.md).

## D-17 — O easter egg do "Paia"

**Resposta:** o "Paia" aparece escondido na arte da splash screen, a tela de abertura do app. Como
ele se esconde na arte fica para o design.

**Onde aparece:** [Contexto](../01-visao-geral/01-contexto.md).

## D-18 — O Maestro e o emulador do PC

**Resposta:** pela rede do próprio PC. O container roda com `--network host`, então o `localhost`
dele é o do PC: o Maestro roda no container e fala com o adb do PC em `localhost:5037`, o único lugar
onde ele procura aparelhos (issue #3461 do Maestro, aberta). O Java, o Maestro e o adb são os do PC,
montados no container. Antes disso, a sessão montou um SSH com uma chave que só rodava o Maestro no
PC, desfeito ao se ver que o container já alcançava o adb: o SSH só somava o risco de rodar
processos no PC.

**Onde aparece:** [Jornadas de Teste](../05-arquitetura/02-jornadas-de-teste.md).

## D-19 — O nome no Google falso

**Resposta:** sim. O emulador do Auth lê o campo `name` do JSON como o nome da conta (no código do
emulador, `const displayName = claims.name`), e a entrada de teste manda o nome junto com o e-mail.
A documentação do Firebase só mostra `sub`, `email` e `email_verified`, num exemplo da web.

**Onde aparece:** [Jornadas de Teste](../05-arquitetura/02-jornadas-de-teste.md).

## D-20 — A jornada do compartilhamento

**Dúvida:** como a jornada chega à tela de compartilhar do Android.

**O que se sabe:** o Maestro comanda o aparelho inteiro, então pode abrir o app de arquivos,
compartilhar e escolher o Livro-Caixa, como a família faz. A alternativa é um
`adb shell am start -a android.intent.action.SEND …` antes do fluxo, mais frágil, porque precisa de
um endereço de arquivo que o app consiga ler. Nenhuma das duas foi testada.

**Onde aparece:** [Jornadas de Teste](../05-arquitetura/02-jornadas-de-teste.md).

## D-21 — A aba do meio

**Resposta:** a aba se chama Meus pagamentos e mostra um mês por vez, com a troca de mês, como o
Início. A sessão de design tinha usado "Meus lançamentos", pelo glossário (a conta é da família, e o
que é de cada um são os lançamentos); Leonardo escolheu "Meus pagamentos", mesmo com as contas
avulsas na lista.

**Onde aparece:** [Meus Pagamentos](../03-funcionalidades/01-principal/06-meus-pagamentos.md).

## D-22 — Ler o valor no comprovante

**Resposta:** fica como evolução futura, no Escopo Excluído. Quando entrar, a leitura é feita no
próprio celular, com o reconhecimento de texto do ML Kit
(`@infinitered/react-native-mlkit-text-recognition`). A sessão que pesquisou recomendou o Gemini,
pelo Firebase AI Logic (`@react-native-firebase/ai`), que lê o PDF direto e devolve só o valor, mas
envia o comprovante ao Google. A escolha foi a leitura no celular. Falta confirmar se o pacote do
ML Kit funciona na nova arquitetura do React Native 0.88.

**Onde aparece:** [Leitura do Valor pelo Comprovante](../04-escopo-excluido/07-leitura-do-valor-pelo-comprovante.md),
[Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md).

## D-23 — O PDF dentro do app

**Resposta:** o PDF abre dentro do app, na primeira versão, como a imagem: em tela cheia, sobre
fundo escuro, com zoom e, embaixo, de que lançamento ele é. Antes, a página dizia que o app mostrava
o nome e o tamanho do arquivo e o abria no leitor de PDF do celular. A rolagem entre as páginas foi
escolha da sessão. O PDF é desenhado pela `react-native-better-pdf`, com a `react-native-pdf` como
plano B.

**Onde aparece:** [Comprovantes](../03-funcionalidades/01-principal/05-comprovantes.md),
[Plataforma e Stack](../05-arquitetura/01-plataforma-e-stack.md).
