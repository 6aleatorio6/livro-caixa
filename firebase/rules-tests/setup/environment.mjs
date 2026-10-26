import { readFileSync } from 'node:fs';
import { after, before, beforeEach } from 'node:test';

import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { setDoc } from 'firebase/firestore';

import { SEEDED_BILL, SEEDED_TAG, oneOffBillOf, receiptContentOf, receiptFileOf, recurringPaymentOf } from './documents.mjs';
import { entryDocOf, entryOf, fileContentOf, fileOf, recurringBillOf, tagsDocOf } from './refs.mjs';

// O ambiente dos testes das regras: cada arquivo `*.test.mjs` importa o `setup/`, que liga os emuladores
// do Firestore (`pnpm test:rules`, no PC, que tem o Java) e semeia a lista antes de cada caso. Os
// arquivos limpam o mesmo emulador a cada caso, então não rodam em paralelo (`--test-concurrency=1`).
export let testEnvironment;

before(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId: 'demo-livro-caixa',
    firestore: { rules: readFileSync('firebase/firestore.rules', 'utf8') },
  });
});

// Ana (admin) e Bruno (membro) já entraram, então têm o `uid` do login gravado; Davi (membro com
// lançamentos) está na lista e ainda não entrou, sem `uid`. Carla não está. Os documentos de
// `settings/tags` (uma tag, Casa) e de `recurringBills/internet`, `aluguel` e `luz` ficam semeados para os casos de
// leitura, de mudança e de exclusão.
beforeEach(async () => {
  await testEnvironment.clearFirestore();
  await asOwner(async (firestore) => {
    await setDoc(entryOf(firestore, 'ana@gmail.com'), { name: 'Ana', uid: 'uid-ana', isAdmin: true, hasEntries: false });
    await setDoc(entryOf(firestore, 'bruno@gmail.com'), { name: 'Bruno', uid: 'uid-bruno', isAdmin: false, hasEntries: false });
    await setDoc(entryOf(firestore, 'davi@gmail.com'), { name: 'Davi', isAdmin: false, hasEntries: true });
    await setDoc(tagsDocOf(firestore), { items: { t1: { ...SEEDED_TAG } } });
    await setDoc(recurringBillOf(firestore, 'internet'), { ...SEEDED_BILL });
    await setDoc(recurringBillOf(firestore, 'aluguel'), { ...SEEDED_BILL, name: 'Aluguel' });
    await setDoc(recurringBillOf(firestore, 'luz'), { ...SEEDED_BILL, name: 'Luz' });
    // Uma conta avulsa de cada um, com o registro e o conteúdo do comprovante, para `get`, `update` e `delete`.
    await seedReceipt(firestore, 'fana1', { uploadedBy: 'uid-ana' });
    await setDoc(entryDocOf(firestore, 'ana1'), oneOffBillOf({ paidBy: 'uid-ana', receiptFileId: 'fana1' }));
    await seedReceipt(firestore, 'fbruno1');
    await setDoc(entryDocOf(firestore, 'bruno1'), oneOffBillOf({ paidBy: 'uid-bruno', receiptFileId: 'fbruno1' }));
    // Um pagamento de conta recorrente de cada um, no mês 2026-10 (o da Ana é do aluguel, o do Bruno da luz;
    // `internet` fica livre para o pagamento novo), para o segundo pagamento, o `update` e o `delete`.
    await seedReceipt(firestore, 'fpana', { uploadedBy: 'uid-ana' });
    await setDoc(entryDocOf(firestore, '2026-10_aluguel'), recurringPaymentOf({ recurringBillId: 'aluguel', name: 'Aluguel', paidBy: 'uid-ana', receiptFileId: 'fpana' }));
    await seedReceipt(firestore, 'fpbruno');
    await setDoc(entryDocOf(firestore, '2026-10_luz'), recurringPaymentOf({ recurringBillId: 'luz', name: 'Luz', paidBy: 'uid-bruno', receiptFileId: 'fpbruno' }));
  });
});

after(() => testEnvironment.cleanup());

// O registro e o conteúdo de um comprovante, gravados juntos como o lote do app os deixa.
function seedReceipt(firestore, id, overrides = {}) {
  const file = receiptFileOf(overrides);
  return Promise.all([setDoc(fileOf(firestore, id), file), setDoc(fileContentOf(firestore, id), receiptContentOf(file.sizeBytes))]);
}

/** Grava ou muda a lista por fora das regras, como quem administra pelo console. */
export function asOwner(write) {
  return testEnvironment.withSecurityRulesDisabled((context) => write(context.firestore()));
}
