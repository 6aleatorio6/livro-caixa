# Acesso

O app só tem login pelo Google, e só entra quem tem o e-mail na lista de e-mails permitidos. O
admin mantém essa lista, só com os e-mails: o nome de cada pessoa vem da conta Google, e depois ela
mesma cuida dele.

## Quem usa e quando

- Todo membro, ao entrar no app.
- O admin, ao cadastrar uma pessoa da família: só o e-mail do Google.
- Todo membro, para mudar o próprio nome, em [Configurações](03-configuracoes.md).

## Login

- O login é só pelo Google. Não há login com e-mail e senha nem com outro provedor
  ([Outras formas de login](../../04-escopo-excluido/03-outras-formas-de-login.md)).
- A tela de entrada mostra a marca, o nome do app, uma frase sobre o app, o botão Entrar com
  Google, uma nota de que só entra quem a família liberou e a versão do app.
- Quem entra com um e-mail do Google fora da lista fica na tela de aguardando permissão: ela mostra
  o e-mail com que a pessoa entrou e pede que quem administra o app o libere. Nenhuma outra tela do
  app fica disponível para ela.
- Liberado o e-mail, o app abre sozinho, sem a pessoa sair e entrar de novo.

## Sair

- Todo membro sai da conta pelo ícone de sair, ao lado do nome, na aba
  [Configurações](03-configuracoes.md).
- Na tela de aguardando permissão, o botão Sair volta para a entrada, para a pessoa entrar com outra
  conta do Google.

## O admin

- É marcado à mão, direto no banco de dados. O app não tem tela para dar ou tirar esse papel.
- O esperado é um admin só, mas o app não confere isso: se mais de uma conta for marcada no banco,
  todas funcionam como admin.
- Tem uma tela para adicionar e remover pessoas da lista de e-mails permitidos, na aba
  [Configurações](03-configuracoes.md). Só ele vê essa tela.
- Cada pessoa entra na lista só com o e-mail do Google, obrigatório. O nome vem da conta Google
  ([O próprio nome](#o-próprio-nome)): até a primeira entrada, a lista mostra a pessoa pelo e-mail,
  como quem ainda não entrou.
- O e-mail não se repete na lista: um e-mail que já está nela é recusado.
- Um e-mail só pode ser removido enquanto a pessoa não tem nenhum lançamento. A partir do primeiro
  pagamento ou conta avulsa, ela não sai mais da lista.

## O próprio nome

- Na primeira entrada, o nome da pessoa é o da conta Google. Se a conta não tiver nome, o app usa o
  começo do e-mail, até o @. Um nome com mais de 60 caracteres é cortado nesse limite.
- Cada membro muda o próprio nome em [Configurações](03-configuracoes.md), pelo lápis ao lado do
  nome, e responde por ele. Ninguém muda o nome de outra pessoa, nem o admin.
- O nome não fica vazio e tem até 60 caracteres.
- O app mostra sempre o nome atual: nos lançamentos da pessoa, inclusive nos registrados antes da
  troca, e na separação por membro do [Início](../01-principal/01-inicio.md).

## Critérios de aceite

- [ ] Um e-mail do Google fora da lista vê a tela de aguardando permissão, com o e-mail usado, e não
      chega a nenhuma outra tela.
- [ ] Liberado o e-mail, a tela de aguardando permissão dá lugar ao app sem a pessoa sair.
- [ ] Na tela de aguardando permissão, Sair volta para a entrada.
- [ ] Em Configurações, o ícone de sair tira o membro da conta e volta para a entrada.
- [ ] Um e-mail adicionado pelo admin consegue entrar.
- [ ] Sem o e-mail, a pessoa não é adicionada.
- [ ] Na primeira entrada, o nome da pessoa é o da conta Google.
- [ ] Quem ainda não entrou aparece na lista de e-mails permitidos pelo e-mail.
- [ ] O nome atual da pessoa aparece nos lançamentos dela, inclusive nos registrados antes de uma
      troca de nome, e na separação por membro do Início.
- [ ] O membro muda o próprio nome em Configurações.
- [ ] Sem nome, a troca não é salva.
- [ ] Nenhum membro, nem o admin, muda o nome de outra pessoa.
- [ ] O app recusa um e-mail que já está na lista.
- [ ] Só o admin vê a tela de e-mails permitidos.
- [ ] O admin remove o e-mail de uma pessoa que ainda não tem lançamentos, e ela deixa de entrar.
- [ ] O app não deixa remover o e-mail de quem já tem um pagamento ou uma conta avulsa.
