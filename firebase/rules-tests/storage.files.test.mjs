import { describe } from 'node:test';

import { assertFails } from '@firebase/rules-unit-testing';

import { STORAGE_MEMBERS as MEMBERS, STORAGE_OUTSIDERS as OUTSIDERS, assertAccess, itEach, rowsFor, seedStorageFile } from './setup.mjs';

const MAX_BYTES = 5 * 1024 * 1024;

const upload = (storage, path, bytes, contentType) => Promise.resolve(storage.ref(path).put(bytes, { contentType }));

// Cada caso tem o seu caminho: o `clearStorage` só limpa a raiz, então o caminho de um caso não pode ser o de outro.
const withPaths = (rows, prefix) => rows.map((row, index) => ({ ...row, path: `files/${prefix}-${index}` }));

// O que o Storage aceita (imagem ou PDF) e o que recusa (SVG), com o nome do caminho de cada tipo.
const FORMATS = [
  { action: 'upload a webp image', contentType: 'image/webp', prefix: 'webp', isAllowed: true },
  { action: 'upload a jpeg image', contentType: 'image/jpeg', prefix: 'jpeg', isAllowed: true },
  { action: 'upload a gif image', contentType: 'image/gif', prefix: 'gif', isAllowed: true },
  { action: 'upload a PDF', contentType: 'application/pdf', prefix: 'pdf', isAllowed: true },
  { action: 'upload a png image', contentType: 'image/png', prefix: 'png', isAllowed: true },
  { action: 'upload an image/jpg image', contentType: 'image/jpg', prefix: 'jpg', isAllowed: true },
  { action: 'upload a heic image', contentType: 'image/heic', prefix: 'heic', isAllowed: true },
  { action: 'upload a heif image', contentType: 'image/heif', prefix: 'heif', isAllowed: true },
  { action: 'upload an SVG', contentType: 'image/svg+xml', prefix: 'svg', isAllowed: false },
];

describe('storage files upload', () => {
  const asMember = MEMBERS[0].as;
  const single = (title, path, size, contentType, isAllowed) => ({ title, as: asMember, path, size, contentType, isAllowed });
  const cases = [
    ...FORMATS.flatMap(({ action, contentType, prefix, isAllowed }) =>
      withPaths(rowsFor(MEMBERS, action, isAllowed, { size: 100, contentType }), prefix),
    ),
    ...withPaths(rowsFor(OUTSIDERS, 'upload an image', false, { size: 100, contentType: 'image/webp' }), 'outsider'),
    single('Should let a member upload a file of 5 MB', 'files/limit', MAX_BYTES, 'image/webp', true),
    single('Should not let a member upload a file of 5 MB plus one byte', 'files/over-limit', MAX_BYTES + 1, 'image/webp', false),
    single('Should not let a member upload a text/plain file', 'files/text', 100, 'text/plain', false),
    single('Should not let a member upload outside files/', 'other/outside', 100, 'image/webp', false),
    single('Should not let a member upload to a subfolder of files/', 'files/a/b', 100, 'image/webp', false),
  ];

  itEach(cases, ({ as, path, size, contentType, isAllowed }) => assertAccess(isAllowed, upload(as(), path, new Uint8Array(size), contentType)));
});

describe('storage files overwrite', () => {
  itEach(withPaths(rowsFor(MEMBERS, 'upload again to the same path', false), 'existing'), async ({ as, path }) => {
    await seedStorageFile(path, new Uint8Array(100), 'image/webp');
    return assertFails(upload(as(), path, new Uint8Array(100), 'image/webp'));
  });
});

// Mudar os metadados de um objeto que existe também fica negado (o emulador já diferiu da produção na sobrescrita).
describe('storage files metadata update', () => {
  itEach(withPaths(rowsFor(MEMBERS, 'change the metadata of a file', false), 'metadata'), async ({ as, path }) => {
    await seedStorageFile(path, new Uint8Array(100), 'image/webp');
    return assertFails(as().ref(path).updateMetadata({ contentType: 'image/png' }));
  });
});

// Ler e apagar o comprovante entram com a tela que o mostra.
describe('storage files read and delete', () => {
  const profiles = [...MEMBERS, ...OUTSIDERS];

  itEach(withPaths(rowsFor(profiles, 'read a file', false), 'read'), async ({ as, path }) => {
    await seedStorageFile(path, new Uint8Array(100), 'image/webp');
    return assertFails(as().ref(path).getDownloadURL());
  });
  itEach(withPaths(rowsFor(profiles, 'delete a file', false), 'delete'), async ({ as, path }) => {
    await seedStorageFile(path, new Uint8Array(100), 'image/webp');
    return assertFails(as().ref(path).delete());
  });
});
