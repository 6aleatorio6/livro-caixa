# Comprovantes

Todo [pagamento](03-pagamento-de-conta-recorrente.md) e toda [conta avulsa](04-conta-avulsa.md) tem
um comprovante: uma imagem ou um PDF. O membro escolhe o arquivo dentro do app ou o compartilha a
partir de outro app do Android. Por enquanto, o app guarda o comprovante, mas não lê o valor nele
([Leitura do valor pelo comprovante](../../04-escopo-excluido/07-leitura-do-valor-pelo-comprovante.md)).

## Formatos e tamanho

| Arquivo | Até 5 MB | Acima de 5 MB |
| --- | --- | --- |
| Imagem | Vai como está | O app a comprime até ficar abaixo de 5 MB, antes de salvar |
| PDF | Vai como está | Recusado: o membro precisa escolher outro arquivo |

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
- [ ] Uma imagem acima de 5 MB é comprimida até ficar abaixo de 5 MB.
- [ ] Um PDF acima de 5 MB é recusado.
- [ ] Dentro do app, o comprovante só vem dos arquivos do celular.
- [ ] Qualquer membro abre o comprovante de um lançamento de outro membro.
- [ ] Uma imagem ou um PDF abre em tela cheia dentro do app, com zoom.
- [ ] Um PDF de várias páginas mostra todas elas, sem abrir outro app.
