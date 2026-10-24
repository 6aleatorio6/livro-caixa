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
| D-07 | O que é o processamento de imagens acima de 5 MB, e o que acontece com um PDF grande? | 🟢 Respondido — a imagem é comprimida até ficar abaixo de 5 MB; o PDF é recusado |
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

**Resposta:** uma imagem acima de 5 MB é comprimida no app até ficar abaixo de 5 MB. Um PDF acima
de 5 MB é recusado.

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
