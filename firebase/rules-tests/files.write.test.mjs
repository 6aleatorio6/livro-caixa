import { describe } from 'node:test';

import { deleteDoc, updateDoc } from 'firebase/firestore';

import { OUTSIDERS, RECEIPT_MAX_BYTES, assertAccess, fileOf, itEach, receiptBatch, receiptFileOf, rowsFor, signedInAs } from './setup/index.mjs';

// O registro do comprovante nasce no lote do lançamento, junto do conteúdo; aqui os dois são gravados sem o
// lançamento, com o `uid` de quem grava.
describe('files create by profile', () => {
  const cases = [
    { title: 'Should let a member create an image file record', as: () => signedInAs('bruno@gmail.com'), data: receiptFileOf(), isAllowed: true },
    { title: 'Should let the admin create an image file record', as: () => signedInAs('ana@gmail.com'), data: receiptFileOf({ uploadedBy: 'uid-ana' }), isAllowed: true },
    ...rowsFor(OUTSIDERS, 'create a file record', false, { data: receiptFileOf() }),
    { title: 'Should not let a member create a file record uploaded by another person', as: () => signedInAs('bruno@gmail.com'), data: receiptFileOf({ uploadedBy: 'uid-ana' }), isAllowed: false },
    { title: 'Should not let the admin create a file record uploaded by another person', as: () => signedInAs('ana@gmail.com'), data: receiptFileOf({ uploadedBy: 'uid-bruno' }), isAllowed: false },
  ];

  itEach(cases, ({ as, data, isAllowed }) => assertAccess(isAllowed, receiptBatch(as(), 'f9', { file: data })));
});

describe('files create by a member', () => {
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    // O PDF chega convertido em imagem: o registro de PDF não existe mais.
    { title: 'Should not let a member create a PDF file record', data: receiptFileOf({ type: 'pdf', contentType: 'application/pdf' }), isAllowed: false },
    { title: 'Should not let a member create an image file record with the PDF contentType', data: receiptFileOf({ contentType: 'application/pdf' }), isAllowed: false },
    { title: 'Should not let a member create a file record with the contentType text/plain', data: receiptFileOf({ contentType: 'text/plain' }), isAllowed: false },
    { title: 'Should not let a member create an image file record with the contentType image/svg+xml', data: receiptFileOf({ contentType: 'image/svg+xml' }), isAllowed: false },
    ...['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'].map((contentType) => ({
      title: `Should let a member create an image file record with the contentType ${contentType}`,
      data: receiptFileOf({ contentType }),
      isAllowed: true,
    })),
    { title: 'Should not let a member create a file record with sizeBytes zero', data: receiptFileOf({ sizeBytes: 0 }), isAllowed: false },
    { title: 'Should not let a member create a file record with sizeBytes above 900 KiB', data: receiptFileOf({ sizeBytes: RECEIPT_MAX_BYTES + 1 }), isAllowed: false },
    { title: 'Should not let a member create a file record with a fractional sizeBytes', data: receiptFileOf({ sizeBytes: 10.5 }), isAllowed: false },
    { title: 'Should let a member create a file record with sizeBytes of 900 KiB', data: receiptFileOf({ sizeBytes: RECEIPT_MAX_BYTES }), isAllowed: true },
    { title: 'Should not let a member create a file record with a storagePath', data: receiptFileOf({ storagePath: 'files/f9' }), isAllowed: false },
    { title: 'Should not let a member create a file record with a key besides the five', data: receiptFileOf({ note: 'a mais' }), isAllowed: false },
    { title: 'Should let a member create a file record with a name of one character', data: receiptFileOf({ name: 'a' }), isAllowed: true },
    { title: 'Should let a member create a file record with a name of 255 characters', data: receiptFileOf({ name: 'a'.repeat(255) }), isAllowed: true },
    { title: 'Should not let a member create a file record with an empty name', data: receiptFileOf({ name: '' }), isAllowed: false },
    { title: 'Should not let a member create a file record with a name of 256 characters', data: receiptFileOf({ name: 'a'.repeat(256) }), isAllowed: false },
    { title: 'Should not let a member create a file record with a numeric name', data: receiptFileOf({ name: 123 }), isAllowed: false },
    ...['type', 'contentType', 'sizeBytes', 'uploadedBy', 'name'].map((key) => ({
      title: `Should not let a member create a file record without ${key}`,
      data: receiptFileOf({ [key]: undefined }),
      isAllowed: false,
    })),
  ];

  itEach(cases, ({ data, isAllowed }) => assertAccess(isAllowed, receiptBatch(bruno(), 'f9', { file: data })));

  itEach(rowsFor([{ who: 'a member', as: bruno }], 'create a file record without its content in the batch', false), ({ as, isAllowed }) =>
    assertAccess(isAllowed, receiptBatch(as(), 'f9', { content: null })),
  );
});

// O registro do comprovante nunca é alterado. A exclusão, só pelo dono e junto do conteúdo, está em
// `fileContents.write.test.mjs`; aqui fica o registro que não sai sozinho.
describe('files update and delete', () => {
  const bruno = { who: 'the owner', as: () => signedInAs('bruno@gmail.com') };
  const otherMember = { who: 'a member, on the file record of another person,', as: () => signedInAs('bruno@gmail.com') };
  const admin = { who: 'the admin, on the file record of a member,', as: () => signedInAs('ana@gmail.com') };
  const profiles = [bruno, otherMember, admin, ...OUTSIDERS];

  itEach(rowsFor(profiles, 'change a file record', false), ({ as, isAllowed }) => assertAccess(isAllowed, updateDoc(fileOf(as(), 'fbruno1'), { sizeBytes: 100 })));
  itEach(rowsFor(profiles, 'change the name of a file record', false), ({ as, isAllowed }) => assertAccess(isAllowed, updateDoc(fileOf(as(), 'fbruno1'), { name: 'outro.webp' })));

  itEach(rowsFor([bruno], 'delete their own file record and keep its content', false), ({ as, isAllowed }) =>
    assertAccess(isAllowed, deleteDoc(fileOf(as(), 'fbruno1'))),
  );
});

// O `delete` de um registro que não existe é um no-op: o lote que o inclui não pode cair por ele.
describe('files delete of a record that does not exist', () => {
  itEach(rowsFor([{ who: 'a member', as: () => signedInAs('bruno@gmail.com') }], 'delete a file record that does not exist', true), ({ as, isAllowed }) =>
    assertAccess(isAllowed, deleteDoc(fileOf(as(), 'missing'))),
  );
});
