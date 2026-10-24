# Acesso

O app só tem login pelo Google, e só entra quem tem o e-mail na lista de e-mails permitidos. O
admin mantém essa lista.

## Quem usa e quando

- Todo membro, ao entrar no app.
- O admin, ao liberar o e-mail de uma pessoa da família.

## Login

- O login é só pelo Google. Não há login com e-mail e senha nem com outro provedor
  ([Outras formas de login](../../04-escopo-excluido/03-outras-formas-de-login.md)).
- Quem entra com um e-mail do Google fora da lista fica numa tela simples, que só avisa que a
  pessoa não tem acesso. Nenhuma outra tela do app fica disponível para ela.

## O admin

- É marcado à mão, direto no banco de dados. O app não tem tela para dar ou tirar esse papel.
- O esperado é um admin só, mas o app não confere isso: se mais de uma conta for marcada no banco,
  todas funcionam como admin.
- Tem uma tela para adicionar e remover e-mails da lista de e-mails permitidos, na aba
  [Configurações](03-configuracoes.md). Só ele vê essa tela.
- Um e-mail só pode ser removido enquanto a pessoa não tem nenhum lançamento. A partir do primeiro
  pagamento ou conta avulsa, ela não sai mais da lista.

## Critérios de aceite

- [ ] Um e-mail do Google fora da lista vê a tela de sem acesso e não chega a nenhuma outra tela.
- [ ] Um e-mail adicionado pelo admin consegue entrar.
- [ ] Só o admin vê a tela de e-mails permitidos.
- [ ] O admin remove o e-mail de uma pessoa que ainda não tem lançamentos, e ela deixa de entrar.
- [ ] O app não deixa remover o e-mail de quem já tem um pagamento ou uma conta avulsa.
