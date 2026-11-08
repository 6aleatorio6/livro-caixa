# Tags

Etiquetas com nome e cor que classificam as [contas recorrentes](../01-principal/02-contas-recorrentes.md)
e as [contas avulsas](../01-principal/04-conta-avulsa.md). Qualquer membro cria e altera tags, numa
tela própria, na aba [Configurações](03-configuracoes.md).

## Quem usa e quando

Qualquer membro, quando precisa de uma tag que ainda não existe ou quer mudar uma que existe.

## O que aparece na tela

- **A lista de tags:** cada tag aparece com o nome, quantas contas a usam e o ícone de tag num
  círculo da cor dela.
- **O seletor de cor**, ao criar e ao alterar uma tag: uma amostra, um círculo na cor, para cada
  uma das oito cores, e a escolhida leva uma marca de ✓. O leitor de tela anuncia cada amostra
  pelo nome da cor.

## Regras

- A tag tem um nome, de até 30 caracteres, e uma cor.
- A cor sai de uma lista fixa, definida no código. O membro escolhe uma das cores da lista e não
  cria cores novas. A lista tem oito cores, que vêm do design: Madeira, Musgo, Petróleo, Ardósia,
  Azul, Anil, Uva e Amora. O leitor de tela anuncia cada amostra do seletor pelo nome da cor.
- As oito cores são discretas e bem distintas entre si: a paleta mudou para cores que se
  distinguem melhor umas das outras, no mesmo tom discreto de antes. Lavanda virou Uva e Ameixa
  virou Amora; as outras seis mantêm o nome.
- A tag guarda no banco qual das oito cores ela tem, e não o valor da cor. Por isso, as tags criadas
  antes da mudança continuam com a mesma cor da lista e passam a mostrá-la no valor novo, sem
  nenhuma alteração no banco.
- Qualquer membro altera o nome e a cor de uma tag.
- Uma tag só pode ser excluída enquanto nenhuma conta recorrente e nenhuma conta avulsa a usa. Excluir uma tag sem uso pede
  confirmação.
- O nome da tag é único, sem diferença entre maiúsculas e minúsculas nem entre letras com e sem
  acento: "Saúde", "saude" e "SAÚDE" são o mesmo nome, e o app recusa uma segunda tag com ele.
- A tag é opcional, tanto na conta recorrente quanto na conta avulsa.
- Cada conta, recorrente ou avulsa, tem no máximo uma tag. Assim, a separação por tag do
  [Início](../01-principal/01-inicio.md) soma o que a família pagou no mês, sem contar uma conta duas
  vezes, e o que não tem tag fica na linha Sem tag.

## Critérios de aceite

- [ ] Qualquer membro cria uma tag com um nome e uma das cores da lista.
- [ ] A tag criada aparece para escolha na conta recorrente e na conta avulsa.
- [ ] Uma conta recorrente ou avulsa fica com uma tag só: escolher outra troca a anterior.
- [ ] Qualquer membro altera o nome e a cor de uma tag.
- [ ] As tags criadas antes da mudança das cores aparecem com a cor nova, sem nenhuma alteração no
      banco.
- [ ] O leitor de tela anuncia cada amostra do seletor pelo nome da cor.
- [ ] A lista de tags mostra o ícone de cada tag num círculo da cor dela.
- [ ] Nos temas claro e escuro, a bolinha da tag tem contraste de pelo menos 3:1 com cada fundo em
      que aparece, e o ícone do círculo, de pelo menos 3:1 com a cor do círculo.
- [ ] Duas cores quaisquer da lista, e a do Sem tag, ficam a pelo menos 0,085 de distância no OKLab, um
      espaço de cor em que a distância acompanha o quanto o olho vê de diferença entre as duas.
- [ ] O app não deixa excluir uma tag que alguma conta, recorrente ou avulsa, usa.
- [ ] Com a tag "Saúde" criada, o app recusa uma nova tag "saude" e a troca do nome de outra tag
      para "SAÚDE".
