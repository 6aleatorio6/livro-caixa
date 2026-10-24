# Conta Avulsa

O membro registra uma conta da família que não se repete, já paga, com o comprovante. A conta entra
no mês da data dela e fica no nome de quem a registrou.

## Quem usa e quando

Qualquer membro, depois de pagar uma conta da família que não é uma
[conta recorrente](02-contas-recorrentes.md).

## O que se registra

| Campo | Regra |
| --- | --- |
| Nome | O que foi a conta. Obrigatório |
| Valor | Obrigatório |
| Data | Vem preenchida com a data de hoje, e o membro pode trocá-la. É ela que define o mês da conta |
| Tag | Opcional ([Tags](../02-suporte/02-tags.md)) |
| Comprovante | Obrigatório ([Comprovantes](05-comprovantes.md)) |

## Fluxo

1. O membro informa o nome e o valor, e confere a data.
2. Escolhe uma tag, se quiser.
3. Anexa o comprovante. Quando o membro chega pelo compartilhamento do Android, escolhendo
   "Conta avulsa" na lista de contas a pagar, o comprovante já vem anexado.
4. Confirma. A conta passa a contar no que já foi pago no [Início](01-inicio.md), no mês da data
   dela.

## Regras

- A conta avulsa é sempre de quem está logado. Não há como registrá-la em nome de outro membro.
- O comprovante é obrigatório.
- Só quem registrou a conta avulsa pode alterá-la ou excluí-la.

## Critérios de aceite

- [ ] Sem comprovante, a conta avulsa não é salva.
- [ ] A data vem preenchida com a data de hoje e pode ser trocada.
- [ ] Uma conta avulsa com data de 30 de setembro, registrada em 2 de outubro, entra em setembro.
- [ ] A conta avulsa é salva sem tag.
- [ ] A conta avulsa fica no nome do membro logado, sem opção de escolher outro.
- [ ] Um membro não consegue alterar nem excluir a conta avulsa de outro.
