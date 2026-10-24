# Comprovantes

Todo [pagamento](03-pagamento-de-conta-recorrente.md) e toda [conta avulsa](04-conta-avulsa.md) tem
um comprovante: uma imagem ou um PDF. O membro escolhe o arquivo dentro do app ou o compartilha a
partir de outro app do Android. Por enquanto, o app guarda o comprovante, mas não lê o valor nele
([Leitura do valor pelo comprovante](../../04-escopo-excluido/07-leitura-do-valor-pelo-comprovante.md)).

## Formatos e tamanho

Cada comprovante tem até 5 MB. Antes de salvar, o app reduz as imagens grandes: a foto que passaria
do limite cabe nele, e a comum sobe numa fração do tamanho.

- **Imagem acima de 2 MB é reduzida no celular.** O lado maior cai para 2560 pixels, e a imagem é
  salva de novo com qualidade de 82%. Ex.: a foto de um boleto feita com uma câmera de 12 MP tem
  4032 pixels de largura e de 2 a 4 MB; com uma de 48 MP, passa dos 10 MB e seria recusada.
- **O corte é pelo tamanho do arquivo, não pelas dimensões.** Saber quantos pixels a imagem tem
  exige abri-la, que é justamente a parte cara; os bytes são o indício barato de que há o que
  reduzir.
- **A imagem reduzida sai em WebP**, qualquer que seja o formato de entrada: na mesma qualidade, o
  WebP fica menor que o JPEG, e o Android abre o formato sem nada a mais.
- **Só foto e print passam pela redução:** JPEG, PNG e WebP. Um GIF perderia os quadros depois do
  primeiro e vai como está.
- **Na dúvida, vale o original.** Se a redução falhar ou não deixar o arquivo menor, o app salva a
  imagem que o membro escolheu. Se ela tiver mais de 5 MB, é recusada, como o PDF.
- **O PDF nunca é tocado.** Até 5 MB, vai como está; acima disso, é recusado, e o membro escolhe
  outro arquivo.

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

- **Imagem:** abre em tela cheia dentro do app, sobre fundo escuro, com zoom. Embaixo, de que
  lançamento ela é.
- **PDF:** abre do mesmo jeito, dentro do app, rolando entre as páginas. O membro não sai para o
  leitor de PDF do celular.

## Critérios de aceite

- [ ] Ao compartilhar uma imagem ou um PDF em outro app do Android, este app aparece entre os
      destinos.
- [ ] O app abre a lista das contas a pagar do mês, com o comprovante anexado e "Conta avulsa" como
      última opção.
- [ ] Uma imagem acima de 2 MB é salva em WebP, com o lado maior em até 2560 pixels.
- [ ] Uma imagem de até 2 MB e um GIF são salvos como estão.
- [ ] Quando a redução falha ou não deixa a imagem menor, o app salva a original.
- [ ] Uma imagem que continua acima de 5 MB depois da redução é recusada.
- [ ] Um PDF acima de 5 MB é recusado.
- [ ] Dentro do app, o comprovante só vem dos arquivos do celular.
- [ ] Qualquer membro abre o comprovante de um lançamento de outro membro.
- [ ] Uma imagem ou um PDF abre em tela cheia dentro do app, com zoom.
- [ ] Um PDF de várias páginas mostra todas elas, sem abrir outro app.
