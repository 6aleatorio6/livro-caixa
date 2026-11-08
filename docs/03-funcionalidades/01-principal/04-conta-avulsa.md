# Conta Avulsa

O membro registra uma conta da família que não se repete, já paga, com o comprovante. A conta entra
no mês da data dela e fica no nome de quem a registrou.

## Quem usa e quando

Qualquer membro, depois de pagar uma conta da família que não é uma
[conta recorrente](02-contas-recorrentes.md).

## O que se registra

| Campo | Regra |
| --- | --- |
| Nome | O que foi a conta. Obrigatório, até 60 caracteres |
| Valor | Obrigatório |
| Data | Vem preenchida com a data de hoje, e o membro pode trocá-la, mas só até hoje (a conta já está paga) e não antes de outubro de 2026, o primeiro mês do app. É ela que define o mês da conta |
| Tag | Opcional ([Tags](../02-suporte/02-tags.md)) |
| Comprovante | Obrigatório ([Comprovantes](05-comprovantes.md)) |

## Fluxo

1. Em [Pagamentos](06-pagamentos.md), o membro toca em Nova conta avulsa, informa o
   nome e o valor, e confere a data.
2. Escolhe uma tag, se quiser.
3. Anexa o comprovante. Quando o membro chega pelo compartilhamento do Android, escolhendo
   "Conta avulsa" na lista de contas a pagar, o comprovante já vem anexado. O valor lido nele
   preenche o valor, se o membro não o tiver digitado
   ([O valor lido do comprovante](05-comprovantes.md#o-valor-lido-do-comprovante)).
4. Confirma. A conta passa a contar no que já foi pago no [Início](01-inicio.md), no mês da data
   dela.

## Regras

- A conta avulsa é sempre de quem está logado. Não há como registrá-la em nome de outro membro.
- A data não pode ser antes de outubro de 2026, o primeiro mês do app: antes dele nenhuma tela
  chega, e a conta ficaria sem como ser aberta, alterada ou excluída.
- O comprovante é obrigatório.
- Só quem registrou a conta avulsa pode alterá-la ou excluí-la.
- Outros membros [contribuem](08-contribuicao.md) com parte dela. Com contribuições, ela não é
  excluída, e a data só muda dentro do mesmo mês.

## Critérios de aceite

- [ ] Sem comprovante, a conta avulsa não é salva.
- [ ] Anexado um comprovante com o valor lido, o valor vem preenchido com ele.
- [ ] A data vem preenchida com a data de hoje e pode ser trocada.
- [ ] Uma conta avulsa com data de 30 de novembro, registrada em 2 de dezembro, entra em novembro.
- [ ] A data não pode ser antes de outubro de 2026: o calendário começa em 1º de outubro de 2026, e uma
      data anterior é recusada com o aviso "A data não pode ser antes de outubro de 2026."
- [ ] A conta avulsa é salva sem tag.
- [ ] A conta avulsa fica no nome do membro logado, sem opção de escolher outro.
- [ ] Um membro não consegue alterar nem excluir a conta avulsa de outro.
