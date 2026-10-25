import {
  BOTH_IN_THE_LIST,
  BRUNO,
  ONE_OFF_BILL,
  ONE_OFF_BILL_DOCUMENT,
  ONE_OFF_BILL_WITHOUT_TAG_DOCUMENT,
  PAYMENT,
  PAYMENT_DOCUMENT,
} from '@/shared/testing/entryFixtures';
import { entryOf } from '@/shared/testing/entryOf';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

export const entryQueryScenarios = {
  // O Bruno abre o pagamento dele (a Luz); o valor pago é corrigido com a folha aberta. As telas de alterar e de
  // excluir abrem o mesmo lançamento: a leitura entrega exatamente o `entry` com que os serviços são chamados.
  paymentOfTheMember: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/2026-10_electricity': PAYMENT_DOCUMENT },
    input: { id: '2026-10_electricity' },
    result: PAYMENT,
    afterChange: {
      write: { 'entries/2026-10_electricity': { ...PAYMENT_DOCUMENT, amountCents: 20000 } },
      result: { ...PAYMENT, amountCents: 20000 },
    },
  },
  // A avulsa do Bruno; quem a lê é qualquer membro, e só o autor a altera ou exclui.
  oneOffBillOfTheMember: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': ONE_OFF_BILL_DOCUMENT },
    input: { id: 'fridge' },
    result: ONE_OFF_BILL,
  },
  oneOffBillWithoutTag: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': ONE_OFF_BILL_WITHOUT_TAG_DOCUMENT },
    input: { id: 'fridge' },
    result: entryOf('fridge', ONE_OFF_BILL_WITHOUT_TAG_DOCUMENT),
  },
  // O autor exclui o lançamento com a folha aberta em outro aparelho: a leitura passa a entregar `null`.
  deletedEntry: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': ONE_OFF_BILL_DOCUMENT },
    input: { id: 'fridge' },
    result: ONE_OFF_BILL,
    afterChange: { write: { 'entries/fridge': null }, result: null },
  },
  // Um id que não existe (um link velho) entrega `null` desde o começo.
  missingEntry: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: { id: 'fridge' },
    result: null,
  },
} satisfies Record<string, IServiceScenario<{ id: string }, IEntry | null>>;
