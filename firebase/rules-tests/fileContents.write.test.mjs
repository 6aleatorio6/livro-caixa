import { describe } from 'node:test';

import { deleteDoc, setDoc, updateDoc } from 'firebase/firestore';

import {
  OUTSIDERS,
  RECEIPT_MAX_BYTES,
  RECEIPT_SIZE_BYTES,
  assertAccess,
  deleteReceiptBatch,
  fileContentOf,
  itEach,
  receiptBatch,
  receiptContentOf,
  receiptFileOf,
  rowsFor,
  signedInAs,
} from './setup/index.mjs';

// Os bytes do comprovante moram em `fileContents/{id}`, ao lado do registro `files/{id}`: nascem no mesmo lote, do
// tamanho que o registro diz, e são de quem enviou o registro.
describe('fileContents create', () => {
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    { title: 'Should let a member create the content of their file record in the same batch', as: bruno, batch: {}, isAllowed: true },
    { title: 'Should let the admin create the content of their file record in the same batch', as: () => signedInAs('ana@gmail.com'), batch: { file: receiptFileOf({ uploadedBy: 'uid-ana' }) }, isAllowed: true },
    ...rowsFor(OUTSIDERS, 'create the content of a file record', false, { batch: {} }),
    {
      title: 'Should let a member create a content of 900 KiB',
      as: bruno,
      batch: { file: receiptFileOf({ sizeBytes: RECEIPT_MAX_BYTES }), content: receiptContentOf(RECEIPT_MAX_BYTES) },
      isAllowed: true,
    },
    {
      title: 'Should not let a member create a content above 900 KiB',
      as: bruno,
      batch: { file: receiptFileOf({ sizeBytes: RECEIPT_MAX_BYTES + 1 }), content: receiptContentOf(RECEIPT_MAX_BYTES + 1) },
      isAllowed: false,
    },
    { title: 'Should not let a member create a content whose size differs from the file record', as: bruno, batch: { content: receiptContentOf(RECEIPT_SIZE_BYTES + 1) }, isAllowed: false },
    { title: 'Should not let a member create a content that is not bytes', as: bruno, batch: { content: { content: 'aGVsbG8=' } }, isAllowed: false },
    { title: 'Should not let a member create a content with a key besides content', as: bruno, batch: { content: { ...receiptContentOf(), note: 'a mais' } }, isAllowed: false },
    { title: 'Should not let a member create a content without the content key', as: bruno, batch: { content: {} }, isAllowed: false },
  ];

  itEach(cases, ({ as, batch, isAllowed }) => assertAccess(isAllowed, receiptBatch(as(), 'f9', batch)));

  const alone = [
    { title: 'Should not let a member create a content without its file record in the batch', run: () => setDoc(fileContentOf(bruno(), 'f9'), receiptContentOf()) },
    // `fana1` é da Ana: o conteúdo dela não é de quem grava, e já existe (o `create` viraria `update`).
    { title: 'Should not let a member create the content of a file record of another person', run: () => setDoc(fileContentOf(bruno(), 'fana1'), receiptContentOf()) },
    {
      title: 'Should not let a member create a content next to a file record uploaded by another person',
      run: () => receiptBatch(signedInAs('ana@gmail.com'), 'f9', { file: receiptFileOf(), content: receiptContentOf() }),
    },
  ];

  itEach(alone, ({ run }) => assertAccess(false, run()));
});

// O conteúdo nunca muda; sai só com o registro, pelo dono, no lote da exclusão ou da troca. A exclusão do par é
// conferida aqui, pelas duas regras juntas.
describe('fileContents update and delete', () => {
  const bruno = { who: 'the owner', as: () => signedInAs('bruno@gmail.com') };
  const otherMember = { who: 'a member, on the content of another person,', as: () => signedInAs('bruno@gmail.com') };
  const admin = { who: 'the admin, on the content of a member,', as: () => signedInAs('ana@gmail.com') };

  itEach(rowsFor([bruno, otherMember, admin, ...OUTSIDERS], 'change a content', false), ({ as, isAllowed }) =>
    assertAccess(isAllowed, updateDoc(fileContentOf(as(), 'fbruno1'), receiptContentOf())),
  );

  const deleteCases = [
    ...rowsFor([bruno], 'delete their own content with the file record', true, { id: 'fbruno1' }),
    ...rowsFor([otherMember], 'delete a content with the file record', false, { id: 'fana1' }),
    ...rowsFor([admin], 'delete a content with the file record', false, { id: 'fbruno1' }),
    ...rowsFor(OUTSIDERS, 'delete a content with the file record', false, { id: 'fbruno1' }),
  ];

  itEach(deleteCases, ({ as, id, isAllowed }) => assertAccess(isAllowed, deleteReceiptBatch(as(), id)));

  // O `delete` de um conteúdo que não existe é um no-op: o lote que o inclui não pode cair por ele.
  itEach(rowsFor([bruno], 'delete a content that does not exist', true), ({ as, isAllowed }) =>
    assertAccess(isAllowed, deleteDoc(fileContentOf(as(), 'missing'))),
  );
});
