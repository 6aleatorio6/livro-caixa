import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { ANA, BOTH_IN_THE_LIST, BRUNO, RECEIPT_FILE_ID } from '@/shared/testing/entryFixtures';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// O comprovante dos lançamentos dos cenários de alterar e excluir: o PNG dos contratos, gravado em `fileContents`.
const RECEIPT_URI = `data:image/png;base64,${RECEIPT_FIXTURE.base64}`;

export const getReceiptContentScenarios = {
  // A Ana abre o comprovante que o Bruno enviou: a leitura é de todo membro.
  receiptOfAnotherMember: {
    signedInAs: ANA,
    given: BOTH_IN_THE_LIST,
    fileContentsGiven: [RECEIPT_FILE_ID],
    input: [RECEIPT_FILE_ID, 'image/png'],
    result: RECEIPT_URI,
  },
} satisfies Record<string, IServiceScenario<[string, string], string>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const getReceiptContentRejectedScenarios = {
  // O registro existe, mas o conteúdo não (um registro sem os bytes).
  receiptContentMissing: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: [RECEIPT_FILE_ID, 'image/png'],
    result: { code: 'RECEIPT_NOT_FOUND', userMessage: 'O comprovante não foi encontrado.' },
  },
} satisfies Record<string, IServiceScenario<[string, string], { code: string; userMessage: string }>>;

/**
 * Os casos em que o serviço deixa passar o erro do Firebase como veio (não é um `AppError`): a `result` é o `code`
 * dele, como o SDK JavaScript do contrato o dá (no aparelho, o React Native Firebase o prefixa: `firestore/…`). Quem
 * pede é a Carla, que está fora da lista, e a regra recusa a leitura.
 */
export const getReceiptContentFailedScenarios = {
  outsiderAsksForContent: {
    signedInAs: 'carla.lima@exemplo.com',
    given: BOTH_IN_THE_LIST,
    fileContentsGiven: [RECEIPT_FILE_ID],
    input: [RECEIPT_FILE_ID, 'image/png'],
    result: { code: 'permission-denied' },
  },
} satisfies Record<string, IServiceScenario<[string, string], { code: string }>>;
