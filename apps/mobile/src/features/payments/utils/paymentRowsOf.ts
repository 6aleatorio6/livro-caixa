import type { IMemberPart } from '@/shared/types/entry/MemberPart';

import type { IPaymentRow } from '../types/PaymentRow';

/**
 * As linhas da lista de Pagamentos: uma por parte de cada pessoa em `selectedUids`, ou de todas, com `null` (inclusive
 * a de quem já não está na lista de pessoas). A ordem é a das partes que recebe, a do `memberPartsOf`: as contas na
 * ordem do serviço do mês e, em cada uma, a parte de quem pagou e depois as contribuições, da mais antiga para a mais
 * nova. A contribuição de quem está marcado, sem o pagamento dela na lista, fica no lugar da conta. A parte de quem
 * pagou fica mesmo zerada (as contribuições cobrem a conta toda): a pessoa a registrou e a edita ou apaga por essa
 * linha, e ela não muda nenhuma soma. A negativa (contribuições acima do pago, que as regras não impedem) também
 * fica, para a soma das linhas bater com o total.
 */
export function paymentRowsOf(parts: IMemberPart[], selectedUids: ReadonlySet<string> | null): IPaymentRow[] {
  return parts
    .filter(({ uid }) => selectedUids === null || selectedUids.has(uid))
    .map((part) => ({ ...part, key: part.contribution?.id ?? `${part.entry.id}:${part.uid}` }));
}
