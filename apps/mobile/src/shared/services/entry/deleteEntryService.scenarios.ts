import {
  ANA,
  CONTRIBUTION,
  CONTRIBUTION_DOCUMENT,
  CONTRIBUTION_FILE_ID,
  BOTH_IN_THE_LIST,
  BRUNO,
  ONE_OFF_BILL,
  ONE_OFF_BILL_DOCUMENT,
  PAYMENT,
  PAYMENT_DOCUMENT,
  RECEIPT_FILE_ID,
  UNOWNED_PAYMENT,
  UNOWNED_PAYMENT_DOCUMENT,
} from '@/shared/testing/entryFixtures';
import { entryOf } from '@/shared/testing/entryOf';
import { receiptOf } from '@/shared/testing/receiptOf';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IContributionEntry } from '@/shared/types/entry/ContributionEntry';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

import type { deleteEntryService } from './deleteEntryService';

type IDeleteEntryArguments = Parameters<typeof deleteEntryService>;

/** O que o contrato confere depois do serviço: os lançamentos que ficam (nenhum, sem o campo). */
interface IDeleteEntryExpectation {
  remainingEntryIds?: string[];
}

// A Internet de outubro sem dono, com as contribuições da Ana e do Bruno; cada uma tem o seu comprovante.
const contributionOnInternet = (id: string, email: string, amountCents: number, receiptFileId: string) => {
  const fields = {
    kind: 'contribution',
    month: '2026-10',
    entryId: '2026-10_internet',
    amountCents,
    paidBy: testAccountUid(email),
    receiptFileId,
  } as const;
  return {
    document: { ...fields, createdAt: new Date('2026-10-09T15:00:00Z') },
    entry: { id, ...fields, paidOn: '2026-10-09' } satisfies IContributionEntry,
  };
};
const ANA_ON_INTERNET = contributionOnInternet('c-ana', ANA, 5000, 'f-ana');
const BRUNO_ON_INTERNET = contributionOnInternet('c-bruno', BRUNO, 3000, 'f-bruno');

export const deleteEntryScenarios = {
  // O pagamento, o registro e o conteúdo do comprovante somem, e o mês deixa de trazê-lo. As telas excluem o lançamento
  // que a leitura por id entregou, que é este `entry`.
  memberDeletesPayment: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_electricity': PAYMENT_DOCUMENT,
      ...receiptOf(RECEIPT_FILE_ID, BRUNO).fileDocuments,
    },
    fileContentsGiven: receiptOf(RECEIPT_FILE_ID, BRUNO).fileContentIds,
    input: [PAYMENT],
    result: undefined,
  },
  memberDeletesOneOffBill: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/fridge': ONE_OFF_BILL_DOCUMENT,
      ...receiptOf(RECEIPT_FILE_ID, BRUNO).fileDocuments,
    },
    fileContentsGiven: receiptOf(RECEIPT_FILE_ID, BRUNO).fileContentIds,
    input: [ONE_OFF_BILL],
    result: undefined,
  },
  // O conteúdo do comprovante não existe (um registro sem os bytes): a exclusão termina sem erro.
  memberDeletesEntryWithMissingContent: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/fridge': ONE_OFF_BILL_DOCUMENT,
      ...receiptOf(RECEIPT_FILE_ID, BRUNO).fileDocuments,
    },
    input: [ONE_OFF_BILL],
    result: undefined,
  },
  // O registro do comprovante já não existe (apagado por fora): o lote ainda exclui o lançamento.
  memberDeletesEntryWithoutFileRecord: {
    signedInAs: BRUNO,
    given: { ...BOTH_IN_THE_LIST, 'entries/fridge': ONE_OFF_BILL_DOCUMENT },
    input: [ONE_OFF_BILL],
    result: undefined,
  },
  // A Ana exclui a única contribuição da Internet: o pagamento sem dono sai no mesmo lote, e o mês volta a seguir a conta.
  memberDeletesLastContribution: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_internet': UNOWNED_PAYMENT_DOCUMENT,
      'entries/c-ana': ANA_ON_INTERNET.document,
      ...receiptOf('f-ana', ANA).fileDocuments,
    },
    fileContentsGiven: receiptOf('f-ana', ANA).fileContentIds,
    input: [ANA_ON_INTERNET.entry, [UNOWNED_PAYMENT, ANA_ON_INTERNET.entry]],
    result: undefined,
  },
  // Com a contribuição do Bruno, o pagamento sem dono fica.
  memberDeletesOneOfTwoContributions: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_internet': UNOWNED_PAYMENT_DOCUMENT,
      'entries/c-ana': ANA_ON_INTERNET.document,
      'entries/c-bruno': BRUNO_ON_INTERNET.document,
      ...receiptOf('f-ana', ANA).fileDocuments,
    },
    fileContentsGiven: receiptOf('f-ana', ANA).fileContentIds,
    input: [ANA_ON_INTERNET.entry, [UNOWNED_PAYMENT, ANA_ON_INTERNET.entry, BRUNO_ON_INTERNET.entry]],
    result: undefined,
    remainingEntryIds: ['2026-10_internet', 'c-bruno'],
  },
  // A contribuição da Ana na Luz paga pelo Bruno: a Luz fica.
  memberDeletesContributionToPaidEntry: {
    signedInAs: ANA,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_electricity': PAYMENT_DOCUMENT,
      'entries/c-ana': CONTRIBUTION_DOCUMENT,
      ...receiptOf(CONTRIBUTION_FILE_ID, ANA).fileDocuments,
    },
    fileContentsGiven: receiptOf(CONTRIBUTION_FILE_ID, ANA).fileContentIds,
    input: [CONTRIBUTION, [PAYMENT, CONTRIBUTION]],
    result: undefined,
    remainingEntryIds: ['2026-10_electricity'],
  },
} satisfies Record<string, IServiceScenario<IDeleteEntryArguments, void> & IDeleteEntryExpectation>;

/** Os casos recusados: o serviço lança `AppError`, a `result` é o que o erro carrega e nada muda. */
export const deleteEntryRejectedScenarios = {
  // A avulsa é da Ana: o lote do Bruno é recusado, e o lançamento, o registro e o conteúdo ficam.
  memberDeletesEntryOfAnother: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/fridge': { ...ONE_OFF_BILL_DOCUMENT, paidBy: testAccountUid(ANA) },
      ...receiptOf(RECEIPT_FILE_ID, ANA).fileDocuments,
    },
    fileContentsGiven: receiptOf(RECEIPT_FILE_ID, ANA).fileContentIds,
    input: [entryOf('fridge', { ...ONE_OFF_BILL_DOCUMENT, paidBy: testAccountUid(ANA) })],
    result: { code: 'ENTRY_DELETE_DENIED', userMessage: 'Não deu para excluir o lançamento.' },
  },
  // O autor exclui o pagamento que a folha mostra, mas ele já foi excluído (em outro aparelho): o lote não acha o lançamento
  // para a regra conferir o autor, é recusado, e nada muda.
  memberDeletesEntryDeletedMeanwhile: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: [PAYMENT],
    result: { code: 'ENTRY_DELETE_DENIED', userMessage: 'Não deu para excluir o lançamento.' },
  },
  // A contribuição é da Ana: o Bruno não a exclui.
  memberDeletesContributionOfAnother: {
    signedInAs: BRUNO,
    given: {
      ...BOTH_IN_THE_LIST,
      'entries/2026-10_internet': UNOWNED_PAYMENT_DOCUMENT,
      'entries/c-ana': ANA_ON_INTERNET.document,
      ...receiptOf('f-ana', ANA).fileDocuments,
    },
    fileContentsGiven: receiptOf('f-ana', ANA).fileContentIds,
    input: [ANA_ON_INTERNET.entry, [UNOWNED_PAYMENT, ANA_ON_INTERNET.entry]],
    result: { code: 'ENTRY_DELETE_DENIED', userMessage: 'Não deu para excluir o lançamento.' },
  },
} satisfies Record<string, IServiceScenario<IDeleteEntryArguments, { code: string; userMessage: string }>>;
