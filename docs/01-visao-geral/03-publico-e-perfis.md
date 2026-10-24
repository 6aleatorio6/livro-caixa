# Público e Perfis

O app é usado pelos membros de uma família. Há dois perfis:

| Perfil | Quem é | O que faz |
| --- | --- | --- |
| **Membro** | Pessoa da família cujo e-mail do Google está na lista de e-mails permitidos | Vê o [Início](../03-funcionalidades/01-principal/01-inicio.md), cadastra e [paga](../03-funcionalidades/01-principal/03-pagamento-de-conta-recorrente.md) [contas recorrentes](../03-funcionalidades/01-principal/02-contas-recorrentes.md), registra [contas avulsas](../03-funcionalidades/01-principal/04-conta-avulsa.md) e cria [tags](../03-funcionalidades/02-suporte/02-tags.md) |
| **Admin** | Um membro marcado como admin direto no banco de dados | Tudo o que o membro faz, mais manter a lista de e-mails permitidos ([Acesso](../03-funcionalidades/02-suporte/01-acesso.md)) |

## Regras

- Quem não está na lista de e-mails permitidos não entra no app: fica numa tela que avisa que não
  tem acesso.
- O papel de admin é dado à mão, no banco de dados. Nenhuma tela do app dá ou tira esse papel.
- Todo lançamento fica no nome de quem está logado: ninguém registra um pagamento ou uma conta
  avulsa em nome de outro membro.
- Todos os membros veem os mesmos dados: o Início não muda de pessoa para pessoa.
- Só quem registrou um lançamento pode alterá-lo ou excluí-lo.
- O esperado é um admin só, mas o app não confere isso.
