import { ANA, BOTH_IN_THE_LIST, BRUNO, RECEIPT_FILE_ID } from '@/shared/testing/entryFixtures';
import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// O comprovante dos lançamentos dos cenários de alterar e excluir, no Storage.
const RECEIPT_PATH = `files/${RECEIPT_FILE_ID}`;

/**
 * O endereço de verdade leva um token sorteado pelo Storage, então o contrato não o compara com a `result`:
 * ele confere que o endereço vem do objeto pedido e que abrir o endereço devolve o arquivo (200 e o tipo do
 * objeto). A `result` é só o texto que o teste de página recebe no lugar do endereço.
 */
export const RECEIPT_URL_EXAMPLE = `https://storage.example.com/${RECEIPT_PATH}?alt=media&token=abc`;

export const getReceiptUrlScenarios = {
  // A Ana abre o comprovante que o Bruno enviou: o objeto é dele, e a leitura é de todo membro.
  receiptOfAnotherMember: {
    signedInAs: ANA,
    given: BOTH_IN_THE_LIST,
    storageGiven: { [RECEIPT_PATH]: { contentType: 'image/png', uploadedBy: testAccountUid(BRUNO) } },
    input: [RECEIPT_PATH],
    result: RECEIPT_URL_EXAMPLE,
  },
  // O PDF da Luz, que o próprio Bruno enviou: o objeto é `application/pdf`, e o endereço abre as páginas.
  pdfReceiptOfTheMember: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    storageGiven: { [RECEIPT_PATH]: { contentType: 'application/pdf', uploadedBy: testAccountUid(BRUNO) } },
    input: [RECEIPT_PATH],
    result: `https://storage.example.com/${RECEIPT_PATH}?alt=media&token=def`,
  },
} satisfies Record<string, IServiceScenario<[string], string>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const getReceiptUrlRejectedScenarios = {
  // O registro existe, mas o objeto não está no Storage (o envio ou a exclusão falhou antes).
  receiptObjectMissing: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: [RECEIPT_PATH],
    result: { code: 'RECEIPT_NOT_FOUND', userMessage: 'O comprovante não foi encontrado.' },
  },
} satisfies Record<string, IServiceScenario<[string], { code: string; userMessage: string }>>;

/**
 * Os casos em que o serviço deixa passar o erro do Firebase como veio (não é um `AppError`): a `result` é o `code`
 * dele. Quem pede o endereço é a Carla, que está fora da lista, e a regra do Storage recusa a leitura.
 */
export const getReceiptUrlFailedScenarios = {
  outsiderAsksForAddress: {
    signedInAs: 'carla.lima@exemplo.com',
    given: BOTH_IN_THE_LIST,
    storageGiven: { [RECEIPT_PATH]: { contentType: 'image/png', uploadedBy: testAccountUid(BRUNO) } },
    input: [RECEIPT_PATH],
    result: { code: 'storage/unauthorized' },
  },
} satisfies Record<string, IServiceScenario<[string], { code: string }>>;
