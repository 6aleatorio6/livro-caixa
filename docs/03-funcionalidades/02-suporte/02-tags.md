# Tags

Etiquetas com nome e cor que classificam as [contas recorrentes](../01-principal/02-contas-recorrentes.md)
e as [contas avulsas](../01-principal/04-conta-avulsa.md). Qualquer membro cria e altera tags, numa
tela própria.

## Quem usa e quando

Qualquer membro, quando precisa de uma tag que ainda não existe ou quer mudar uma que existe.

## Regras

- A tag tem um nome e uma cor.
- A cor sai de uma lista fixa, definida no código. O membro escolhe uma das cores da lista e não
  cria cores novas.
- Qualquer membro altera o nome e a cor de uma tag.
- Uma tag só pode ser excluída enquanto nenhuma conta recorrente e nenhuma conta avulsa a usa.
- O nome da tag é único, sem diferença entre maiúsculas e minúsculas nem entre letras com e sem
  acento: "Saúde", "saude" e "SAÚDE" são o mesmo nome, e o app recusa uma segunda tag com ele.
- A tag é opcional, tanto na conta recorrente quanto na conta avulsa.

## Critérios de aceite

- [ ] Qualquer membro cria uma tag com um nome e uma das cores da lista.
- [ ] A tag criada aparece para escolha na conta recorrente e na conta avulsa.
- [ ] Qualquer membro altera o nome e a cor de uma tag.
- [ ] O app não deixa excluir uma tag que alguma conta, recorrente ou avulsa, usa.
- [ ] Com a tag "Saúde" criada, o app recusa uma nova tag "saude" e a troca do nome de outra tag
      para "SAÚDE".
