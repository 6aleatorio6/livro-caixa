import { RECEIPT_FIXTURE } from '@/shared/testing/contract/fixtures/receiptFixture';
import { HOME_TAG_ID } from '@/shared/testing/tagFixtures';
import type { IOneOffBillInput } from '@/shared/types/entry/OneOffBillInput';
import type { IServiceScenario } from '@/shared/types/testing/ServiceScenario';

// A pessoa é a conta de teste das jornadas: o Bruno é membro e ainda não lançou nada.
const BRUNO = 'bruno.souza@exemplo.com';
const BRUNO_WITHOUT_ENTRIES = {
  [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: false },
};

// O comprovante é o PNG guardado em `fixtures/`: a `uri` e o tamanho são os dele, e o contrato o envia ao Storage.
const RECEIPT: IOneOffBillInput['receipt'] = {
  uri: RECEIPT_FIXTURE.uri,
  name: 'comprovante.png',
  contentType: 'image/png',
  sizeBytes: RECEIPT_FIXTURE.sizeBytes,
  type: 'image',
  wasReduced: false,
};
const FARMACIA = { name: 'Farmácia', amountCents: 8990, date: '2026-10-12', tagId: HOME_TAG_ID, receipt: RECEIPT };

export const addOneOffBillScenarios = {
  memberAddsOneOffBill: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [FARMACIA],
    result: undefined,
  },
  // Sem tag, a tela envia `tagId: null` e o lançamento nasce sem o campo.
  memberAddsOneOffBillWithoutTag: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [{ ...FARMACIA, tagId: null }],
    result: undefined,
  },
  // A conta de 30/09 entra em setembro, mesmo registrada em outubro.
  memberAddsSeptemberBill: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [{ ...FARMACIA, date: '2026-09-30' }],
    result: undefined,
  },
  // Quem já lançou antes tem `hasEntries` em `true`; o lote o grava de novo sem problema.
  memberWithEntriesAddsOneOffBill: {
    signedInAs: BRUNO,
    given: { [`allowedEmails/${BRUNO}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: true } },
    input: [FARMACIA],
    result: undefined,
  },
} satisfies Record<string, IServiceScenario<[IOneOffBillInput], void>>;

/** Os casos recusados: o serviço lança `AppError`, e a `result` é o que o erro carrega. */
export const addOneOffBillRejectedScenarios = {
  // O Storage só aceita imagem ou PDF: com outro tipo ele recusa o envio, e nada é gravado no Firestore.
  receiptRejectedByStorage: {
    signedInAs: BRUNO,
    given: BRUNO_WITHOUT_ENTRIES,
    input: [{ ...FARMACIA, receipt: { ...RECEIPT, name: 'comprovante.txt', contentType: 'text/plain' } }],
    result: {
      code: 'RECEIPT_UPLOAD_FAILED',
      userMessage: 'Não deu para enviar o comprovante. Confira a internet e tente de novo.',
    },
  },
} satisfies Record<string, IServiceScenario<[IOneOffBillInput], { code: string; userMessage: string }>>;
