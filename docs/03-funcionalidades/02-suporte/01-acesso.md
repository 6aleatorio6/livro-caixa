# Acesso

O app só tem login pelo Google, e só entra quem tem o e-mail na lista de e-mails permitidos. O
admin mantém essa lista, com o nome de cada pessoa.

## Quem usa e quando

- Todo membro, ao entrar no app.
- O admin, ao cadastrar uma pessoa da família: o nome e o e-mail do Google.

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
- Cada pessoa entra na lista com o nome e o e-mail do Google, os dois obrigatórios. O nome é o que
  o app mostra: nos lançamentos da pessoa e na separação por membro do
  [Início](../01-principal/01-inicio.md).
- O e-mail não se repete na lista: um e-mail que já está nela é recusado.
- Um e-mail só pode ser removido enquanto a pessoa não tem nenhum lançamento. A partir do primeiro
  pagamento ou conta avulsa, ela não sai mais da lista.

## Critérios de aceite

- [ ] Um e-mail do Google fora da lista vê a tela de aguardando permissão, com o e-mail usado, e não
      chega a nenhuma outra tela.
- [ ] Liberado o e-mail, a tela de aguardando permissão dá lugar ao app sem a pessoa sair.
- [ ] Na tela de aguardando permissão, Sair volta para a entrada.
- [ ] Em Configurações, o ícone de sair tira o membro da conta e volta para a entrada.
- [ ] Um e-mail adicionado pelo admin consegue entrar.
- [ ] Sem o nome ou sem o e-mail, a pessoa não é adicionada.
- [ ] O nome cadastrado aparece nos lançamentos da pessoa e na separação por membro do Início.
- [ ] O app recusa um e-mail que já está na lista.
- [ ] Só o admin vê a tela de e-mails permitidos.
- [ ] O admin remove o e-mail de uma pessoa que ainda não tem lançamentos, e ela deixa de entrar.
- [ ] O app não deixa remover o e-mail de quem já tem um pagamento ou uma conta avulsa.
