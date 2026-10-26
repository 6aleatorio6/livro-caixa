# Comprovantes

Todo [pagamento](03-pagamento-de-conta-recorrente.md) e toda [conta avulsa](04-conta-avulsa.md) tem
um comprovante: uma imagem ou um PDF. O membro escolhe o arquivo dentro do app ou o compartilha a
partir de outro app do Android. Por enquanto, o app guarda o comprovante, mas não lê o valor nele
([Leitura do valor pelo comprovante](../../04-escopo-excluido/07-leitura-do-valor-pelo-comprovante.md)).

## Formatos e tamanho

Cada comprovante tem até 900 KB e é guardado como imagem. Antes de salvar, o app comprime a imagem
que passa disso, sem deixá-la ilegível, e converte o PDF na imagem da página.

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
- **O PDF de uma página vira a imagem dela**, com o lado maior em 2560 pixels, e desce os mesmos
  degraus. O comprovante guarda o nome do PDF.
- **O PDF de mais de uma página é recusado, por enquanto.** O membro precisa escolher outro arquivo,
  como a foto ou o print da página que tem o pagamento.

## Anexar de dentro do app

O membro escolhe o arquivo, uma imagem ou um PDF, entre os arquivos do celular. O app não abre a
câmera nem a galeria.

## Compartilhar pelo Android

1. Ao compartilhar uma imagem ou um PDF em outro app do celular, este app aparece na lista de
   destinos.
2. Escolhido o app, ele abre a lista das contas a pagar do mês, com o comprovante já anexado.
3. O membro escolhe a conta que está pagando e segue no
   [pagamento](03-pagamento-de-conta-recorrente.md). A última opção da lista é "Conta avulsa", que
   leva à [conta avulsa](04-conta-avulsa.md).

Quem compartilha sem estar logado faz o login pelo Google e perde o arquivo: precisa
compartilhá-lo de novo depois de entrar.

## Ver o comprovante

Qualquer membro vê o comprovante de qualquer lançamento, pelo Ver dos
[detalhes do lançamento](07-detalhes-do-lancamento.md).

O comprovante abre em tela cheia dentro do app, sobre fundo escuro, com zoom. Embaixo, de que
lançamento ele é. O que veio de um PDF abre do mesmo jeito, como a imagem da página, sem sair para o
leitor de PDF do celular.

## Critérios de aceite

- [ ] Ao compartilhar uma imagem ou um PDF em outro app do Android, este app aparece entre os
      destinos.
- [ ] O app abre a lista das contas a pagar do mês, com o comprovante anexado e "Conta avulsa" como
      última opção.
- [ ] Uma imagem de até 900 KB é salva como está.
- [ ] Uma imagem acima de 900 KB é salva em WebP, no primeiro degrau que cabe, baixando a qualidade
      antes do lado maior.
- [ ] Uma imagem que não cabe em 900 KB nem com 1600 pixels e qualidade de 50% é recusada.
- [ ] Um GIF acima de 900 KB é recusado.
- [ ] Um PDF de uma página é salvo como a imagem da página, com o nome do PDF.
- [ ] Um PDF de mais de uma página é recusado.
- [ ] Dentro do app, o comprovante só vem dos arquivos do celular.
- [ ] Qualquer membro abre o comprovante de um lançamento de outro membro.
- [ ] O comprovante abre em tela cheia dentro do app, com zoom, inclusive o que veio de um PDF.
