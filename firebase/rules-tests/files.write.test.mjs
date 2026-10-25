import { describe } from 'node:test';

import { collection, deleteDoc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, assertAccess, fileOf, itEach, receiptFileOf, rowsFor, signedInAs } from './setup.mjs';

// O registro do comprovante nasce no lote do lançamento; aqui ele é gravado sozinho, com o `uid` de quem grava.
describe('files create by profile', () => {
  const cases = [
    { title: 'Should let a member create an image file record', as: () => signedInAs('bruno@gmail.com'), data: receiptFileOf('f9'), isAllowed: true },
    { title: 'Should let the admin create an image file record', as: () => signedInAs('ana@gmail.com'), data: receiptFileOf('f9', { uploadedBy: 'uid-ana' }), isAllowed: true },
    { title: 'Should let a member create a PDF file record', as: () => signedInAs('bruno@gmail.com'), data: receiptFileOf('f9', { type: 'pdf', contentType: 'application/pdf' }), isAllowed: true },
    { title: 'Should let the admin create a PDF file record', as: () => signedInAs('ana@gmail.com'), data: receiptFileOf('f9', { type: 'pdf', contentType: 'application/pdf', uploadedBy: 'uid-ana' }), isAllowed: true },
    ...rowsFor(OUTSIDERS, 'create a file record', false, { data: receiptFileOf('f9') }),
    { title: 'Should not let a member create a file record uploaded by another person', as: () => signedInAs('bruno@gmail.com'), data: receiptFileOf('f9', { uploadedBy: 'uid-ana' }), isAllowed: false },
    { title: 'Should not let the admin create a file record uploaded by another person', as: () => signedInAs('ana@gmail.com'), data: receiptFileOf('f9', { uploadedBy: 'uid-bruno' }), isAllowed: false },
  ];

  itEach(cases, ({ as, data, isAllowed }) => assertAccess(isAllowed, setDoc(fileOf(as(), 'f9'), data)));
});

describe('files create by a member', () => {
  const bruno = () => signedInAs('bruno@gmail.com');
  const cases = [
    { title: 'Should not let a member create a file record with a storagePath outside files/{id}', data: receiptFileOf('f9', { storagePath: 'other/f9' }), isAllowed: false },
    { title: 'Should not let a member create a file record with the storagePath of another file', data: receiptFileOf('f9', { storagePath: 'files/f8' }), isAllowed: false },
    { title: 'Should not let a member create a pdf file record with an image contentType', data: receiptFileOf('f9', { type: 'pdf', contentType: 'image/png' }), isAllowed: false },
    { title: 'Should not let a member create an image file record with the PDF contentType', data: receiptFileOf('f9', { contentType: 'application/pdf' }), isAllowed: false },
    { title: 'Should not let a member create a file record with the contentType text/plain', data: receiptFileOf('f9', { contentType: 'text/plain' }), isAllowed: false },
    { title: 'Should not let a member create an image file record with the contentType image/svg+xml', data: receiptFileOf('f9', { contentType: 'image/svg+xml' }), isAllowed: false },
    ...['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'].map((contentType) => ({
      title: `Should let a member create an image file record with the contentType ${contentType}`,
      data: receiptFileOf('f9', { contentType }),
      isAllowed: true,
    })),
    { title: 'Should not let a member create a file record with sizeBytes zero', data: receiptFileOf('f9', { sizeBytes: 0 }), isAllowed: false },
    { title: 'Should not let a member create a file record with sizeBytes above 5 MB', data: receiptFileOf('f9', { sizeBytes: 5242881 }), isAllowed: false },
    { title: 'Should not let a member create a file record with a fractional sizeBytes', data: receiptFileOf('f9', { sizeBytes: 10.5 }), isAllowed: false },
    { title: 'Should let a member create a file record with sizeBytes of 5 MB', data: receiptFileOf('f9', { sizeBytes: 5242880 }), isAllowed: true },
    { title: 'Should not let a member create a file record with a key besides the five', data: receiptFileOf('f9', { note: 'a mais' }), isAllowed: false },
    ...['storagePath', 'type', 'contentType', 'sizeBytes', 'uploadedBy'].map((key) => ({
      title: `Should not let a member create a file record without ${key}`,
      data: receiptFileOf('f9', { [key]: undefined }),
      isAllowed: false,
    })),
  ];

  itEach(cases, ({ data, isAllowed }) => assertAccess(isAllowed, setDoc(fileOf(bruno(), 'f9'), data)));
});

// Ler e apagar o registro entram com a tela que mostra e troca o comprovante.
describe('files get, list, update and delete', () => {
  const profiles = [...MEMBERS, ...OUTSIDERS];

  itEach(rowsFor(profiles, 'read a file record', false), ({ as, isAllowed }) => assertAccess(isAllowed, getDoc(fileOf(as(), 'fbruno1'))));
  itEach(rowsFor(profiles, 'list the file records', false), ({ as, isAllowed }) => assertAccess(isAllowed, getDocs(collection(as(), 'files'))));
  itEach(rowsFor(profiles, 'change a file record', false), ({ as, isAllowed }) => assertAccess(isAllowed, updateDoc(fileOf(as(), 'fbruno1'), { sizeBytes: 100 })));
  itEach(rowsFor(profiles, 'delete a file record', false), ({ as, isAllowed }) => assertAccess(isAllowed, deleteDoc(fileOf(as(), 'fbruno1'))));
});
