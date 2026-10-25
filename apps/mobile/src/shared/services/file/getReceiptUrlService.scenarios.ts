import { testAccountUid } from '@/shared/testing/testAccountUid';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// As pessoas são as contas de teste das jornadas: Ana e Bruno estão na lista.
const ANA = 'ana.souza@exemplo.com';
const BRUNO = 'bruno.souza@exemplo.com';
const BOTH_IN_THE_LIST = {
  [`allowedEmails/${ANA}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: true },
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true },
};

/**
 * O endereço de verdade leva um token sorteado pelo Storage, então o contrato não o compara com a `result`:
 * ele confere que o endereço vem do objeto pedido e que abrir o endereço devolve o arquivo (200 e o tipo do
 * objeto). A `result` é só o texto que o teste de página recebe no lugar do endereço.
 */
export const RECEIPT_URL_EXAMPLE = 'https://storage.example.com/files/f-fridge?alt=media&token=abc';

export const getReceiptUrlScenarios = {
  // O Bruno abre o comprovante que a Ana enviou: o objeto é dela, e a leitura é de todo membro.
  receiptOfAnotherMember: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    storageGiven: { 'files/f-fridge': { contentType: 'image/png', uploadedBy: testAccountUid(ANA) } },
    input: ['files/f-fridge'],
    result: RECEIPT_URL_EXAMPLE,
  },
} satisfies Record<string, IServiceScenario<[string], string>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const getReceiptUrlRejectedScenarios = {
  // O registro existe, mas o objeto não está no Storage (o envio ou a exclusão falhou antes).
  receiptObjectMissing: {
    signedInAs: BRUNO,
    given: BOTH_IN_THE_LIST,
    input: ['files/f-fridge'],
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
    storageGiven: { 'files/f-fridge': { contentType: 'image/png', uploadedBy: testAccountUid(ANA) } },
    input: ['files/f-fridge'],
    result: { code: 'storage/unauthorized' },
  },
} satisfies Record<string, IServiceScenario<[string], { code: string }>>;
