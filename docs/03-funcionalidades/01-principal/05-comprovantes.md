# Comprovantes

Todo [pagamento](03-pagamento-de-conta-recorrente.md), toda [conta avulsa](04-conta-avulsa.md) e toda
[contribuição](08-contribuicao.md) tem um comprovante: uma imagem ou um PDF. O membro escolhe o arquivo dentro do app ou o compartilha a
partir de outro app do Android. Ao anexá-lo, o app lê nele o valor pago e preenche o valor do
lançamento ([O valor lido do comprovante](#o-valor-lido-do-comprovante)).

## Formatos e tamanho

Cada comprovante tem até 900 KB. Antes de salvar, o app comprime a imagem que passa disso, sem
deixá-la ilegível. O PDF vai como está.

- **A imagem de até 900 KB vai como está.**
- **Acima disso, o app comprime em degraus** e fica com o primeiro resultado que cabe. Primeiro
  baixa a qualidade, com o lado maior em 2560 pixels (82%, 70%, 60% e 50%); depois baixa o lado
  maior, para 2048 pixels (60% e 50%) e para 1600 pixels (50%). Esse último é o piso: abaixo dele,
  o valor de uma nota começa a ficar difícil de ler. Ex.: a foto de um boleto feita com uma câmera
  de 12 MP tem 4032 pixels de largura e de 2 a 4 MB, e costuma caber já no primeiro degrau.
- **A imagem comprimida sai em WebP**, qualquer que seja o formato de entrada: na mesma qualidade, o
  WebP fica menor que o JPEG, e o Android abre o formato sem nada a mais.
- **Passam pela compressão JPEG, PNG, WebP, HEIC e HEIF.** Um GIF perderia os quadros depois do
  primeiro e vai como está.
- **O que não cabe nem no piso é recusado**, e o membro escolhe outro arquivo. Se a compressão
  falhar, vale a imagem original, que também é recusada se passar de 900 KB.
- **O PDF de até 900 KB vai como está**, com qualquer número de páginas: o PDF que o banco gera tem
  poucos KB e cabe com folga.
- **O PDF acima de 900 KB é recusado**, porque não é comprimido. O membro escolhe outro arquivo,
  como a foto ou o print da página que tem o pagamento.

## Anexar de dentro do app

O membro escolhe o arquivo, uma imagem ou um PDF, entre os arquivos do celular. O app não abre a
câmera nem a galeria.

## Compartilhar pelo Android

1. Ao compartilhar uma imagem ou um PDF em outro app do celular, este app aparece na lista de
   destinos.
2. Escolhido o app, ele abre a escolha da conta, com o comprovante já anexado: primeiro "Conta
   avulsa", que leva à [conta avulsa](04-conta-avulsa.md), depois as contas a pagar do mês atual e,
   abaixo, as do próximo mês, que já pode ser pago.
3. O membro escolhe a conta que está pagando e segue no
   [pagamento](03-pagamento-de-conta-recorrente.md) daquele mês.

Abaixo das contas a pagar, a lista mostra as contas já pagas por outros membros, do mês atual e do
próximo. Tocar numa delas abre a [contribuição](08-contribuicao.md) nela, com o comprovante anexado.
Ficam de fora as que não têm mais nada a receber: a soma das contribuições já chegou ao valor pago.

Quem compartilha sem estar logado faz o login pelo Google e perde o arquivo: precisa
compartilhá-lo de novo depois de entrar.

## O valor lido do comprovante

Ao anexar o comprovante, o app lê o texto dele no próprio celular, sem enviá-lo a um serviço de fora,
e preenche o valor pago do [pagamento](03-pagamento-de-conta-recorrente.md), da
[conta avulsa](04-conta-avulsa.md) ou da alteração. O membro confere o valor antes de salvar.

- **O que é lido:** a imagem, ou o PDF até a terceira página: a primeira, e a seguinte só quando a
  anterior não mostra um valor. A leitura acontece enquanto o comprovante é preparado, com o
  carregamento que já cobre a tela.
- **Qual valor:** o valor em reais do comprovante, quando ele mostra um só, mesmo que repetido. Com
  dois valores diferentes, como o do documento e o pago com juros, nada é preenchido. O valor zerado,
  como a tarifa de R$ 0,00, não conta. Ex.: o Pix de R$ 30,00 com a tarifa de R$ 0,00 preenche
  R$ 30,00.
- **O Mercado Pago escreve os centavos menores, acima do número e sem vírgula** (R$ 63⁹⁶): o app o
  reconhece pelo número de operação e lê os dois últimos dígitos como os centavos. Quando a leitura
  traz o valor com a vírgula, vale a regra de cima.
- **O teto:** um valor lido acima de R$ 9.999.999,99, o maior que o campo aceita, não preenche nada. É
  a leitura que colou dígitos.
- **Quando preenche:** enquanto o membro não digitou no campo. O valor digitado fica, mesmo com
  outro comprovante.
- **O aviso:** embaixo do campo, o texto de apoio diz "Veio do comprovante. Corrija se pagou outro
  valor." enquanto o valor mostrado é o lido. Digitado outro valor, volta o texto de antes.
- **Quando o comprovante sai:** trocado por um em que nada se lê, ou recusado, o campo volta ao valor
  com que abriu: o previsto, no pagamento; o salvo, na alteração; vazio, na conta avulsa nova.
- **O comprovante compartilhado** chega com o valor já lido, e o pagamento abre com ele.
- **O valor lido não é guardado:** ele só preenche o campo.

## Ver o comprovante

Qualquer membro vê o comprovante de qualquer lançamento, pelo Ver dos
[detalhes do lançamento](07-detalhes-do-lancamento.md).

O comprovante abre em tela cheia dentro do app, sobre fundo escuro. Embaixo, de que lançamento ele
é.

- **A imagem ocupa a largura da tela**, com a altura da proporção dela. Um print longo, como o de um
  extrato, rola até o fim. A imagem não tem zoom.
- **O PDF abre com as páginas uma embaixo da outra**, rolando, com o zoom de pinça do leitor do app
  e, quando há mais de uma página, a indicação "1 de 2". Ele não sai para o leitor de PDF do
  celular.

Antes de salvar, o membro também abre o comprovante anexado, para conferir o valor enquanto o digita:

- **No pagamento, na conta avulsa e na alteração**, tocar no comprovante anexado o abre em tela cheia,
  do mesmo jeito, sem a faixa do lançamento, que ainda não existe. Só o Trocar escolhe outro arquivo.
  Na alteração, o comprovante já salvo abre como pelo Ver dos detalhes.
- **Na lista do compartilhamento**, tocar no comprovante o abre do mesmo jeito. Ali ele não se troca.

## Critérios de aceite

- [ ] Ao compartilhar uma imagem ou um PDF em outro app do Android, este app aparece entre os
      destinos.
- [ ] O app abre a escolha da conta com o comprovante anexado: "Conta avulsa" primeiro, depois as
      contas a pagar do mês atual e as do próximo mês.
- [ ] Escolhida uma conta da lista do próximo mês, o pagamento é desse mês.
- [ ] A lista mostra, abaixo das contas a pagar, as contas já pagas por outros membros, e tocar
      numa delas abre a contribuição.
- [ ] Uma imagem de até 900 KB é salva como está.
- [ ] Uma imagem acima de 900 KB é salva em WebP, no primeiro degrau que cabe, baixando a qualidade
      antes do lado maior.
- [ ] Uma imagem que não cabe em 900 KB nem com 1600 pixels e qualidade de 50% é recusada.
- [ ] Um GIF acima de 900 KB é recusado.
- [ ] Um PDF de até 900 KB é salvo como está, com qualquer número de páginas.
- [ ] Um PDF acima de 900 KB é recusado.
- [ ] Dentro do app, o comprovante só vem dos arquivos do celular.
- [ ] Qualquer membro abre o comprovante de um lançamento de outro membro.
- [ ] A imagem abre em tela cheia na largura da tela e rola na vertical, sem zoom.
- [ ] O PDF abre em tela cheia dentro do app, com as páginas rolando.
- [ ] No pagamento, tocar no comprovante compartilhado o abre em tela cheia, sem abrir a escolha de
      arquivo; o Trocar abre a escolha.
- [ ] Na lista do compartilhamento, tocar no comprovante o abre em tela cheia.
- [ ] O valor em reais de um comprovante que mostra um só valor, mesmo repetido, preenche o valor
      pago.
- [ ] Um comprovante com dois valores diferentes não preenche nada.
- [ ] O Pix de R$ 30,00 com a tarifa de R$ 0,00 preenche R$ 30,00.
- [ ] O comprovante do Mercado Pago de R$ 63⁹⁶ preenche R$ 63,96, também quando a leitura traz a
      vírgula.
- [ ] Um valor lido acima de R$ 9.999.999,99 não preenche nada.
- [ ] O valor que só aparece na segunda página do PDF preenche o valor pago.
- [ ] Com o valor na primeira página, a segunda não é lida.
- [ ] Do PDF, no máximo as três primeiras páginas são lidas.
- [ ] O valor que o membro digitou não é trocado pelo do comprovante.
- [ ] Com o valor lido, o campo diz "Veio do comprovante. Corrija se pagou outro valor."; digitado
      outro valor, o aviso sai.
- [ ] Trocado por um comprovante sem valor lido, ou recusado, o campo volta ao valor com que abriu.
- [ ] O pagamento aberto pelo compartilhamento já vem com o valor lido.
