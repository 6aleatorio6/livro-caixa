import { describe } from 'node:test';

import { assertFails } from '@firebase/rules-unit-testing';

import { STORAGE_MEMBERS as MEMBERS, STORAGE_OUTSIDERS as OUTSIDERS, assertAccess, itEach, rowsFor, seedStorageFile } from './setup/index.mjs';

const MAX_BYTES = 5 * 1024 * 1024;

// O envio leva o autor nos metadados do objeto (`uploadedBy`): `null` o deixa de fora.
const upload = (storage, path, bytes, contentType, uploadedBy) =>
  Promise.resolve(storage.ref(path).put(bytes, uploadedBy === null ? { contentType } : { contentType, customMetadata: { uploadedBy } }));

// Quem fora da lista também envia o próprio `uid` nos metadados, para a recusa vir da lista e não dos metadados.
const uploaderOf = ({ uid }) => uid ?? 'uid-bruno';

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
  const single = (title, path, size, contentType, isAllowed) => ({ title, as: asMember, uid: MEMBERS[0].uid, path, size, contentType, isAllowed });
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
    ...withPaths(
      [
        { title: 'Should not let a member upload an image without uploadedBy in the metadata', as: asMember, uid: null, size: 100, contentType: 'image/webp', isAllowed: false },
        { title: 'Should not let a member upload an image with the uid of another person in the metadata', as: asMember, uid: 'uid-ana', size: 100, contentType: 'image/webp', isAllowed: false },
        { title: 'Should not let the admin upload an image with the uid of another person in the metadata', as: MEMBERS[1].as, uid: 'uid-bruno', size: 100, contentType: 'image/webp', isAllowed: false },
      ],
      'metadata-author',
    ),
  ];

  itEach(cases, ({ as, path, size, contentType, uid, isAllowed }) =>
    assertAccess(isAllowed, upload(as(), path, new Uint8Array(size), contentType, uid === null ? null : uid === undefined ? 'uid-bruno' : uid)),
  );
});

describe('storage files overwrite', () => {
  itEach(withPaths(rowsFor(MEMBERS, 'upload again to the same path', false), 'existing'), async (row) => {
    const { as, path } = row;
    await seedStorageFile(path, new Uint8Array(100), 'image/webp', { uploadedBy: uploaderOf(row) });
    return assertFails(upload(as(), path, new Uint8Array(100), 'image/webp', uploaderOf(row)));
  });
});

// Mudar os metadados de um objeto que existe também fica negado (o emulador já diferiu da produção na sobrescrita).
describe('storage files metadata update', () => {
  itEach(withPaths(rowsFor(MEMBERS, 'change the metadata of a file', false), 'metadata'), async (row) => {
    const { as, path } = row;
    await seedStorageFile(path, new Uint8Array(100), 'image/webp', { uploadedBy: uploaderOf(row) });
    return assertFails(as().ref(path).updateMetadata({ contentType: 'image/png' }));
  });
});

// Todo membro vê o comprovante de qualquer um; só o dono (`uploadedBy` nos metadados do objeto) o apaga.
describe('storage files get', () => {
  const cases = [...withPaths(rowsFor(MEMBERS, 'read a file of the owner', true), 'read'), ...withPaths(rowsFor(OUTSIDERS, 'read a file', false), 'read-out')];

  itEach(cases, async ({ as, path, isAllowed }) => {
    await seedStorageFile(path, new Uint8Array(100), 'image/webp', { uploadedBy: 'uid-bruno' });
    return assertAccess(isAllowed, as().ref(path).getDownloadURL());
  });
  itEach(cases.map((row) => ({ ...row, title: `${row.title} (metadata)`, path: `${row.path}-meta` })), async ({ as, path, isAllowed }) => {
    await seedStorageFile(path, new Uint8Array(100), 'image/webp', { uploadedBy: 'uid-bruno' });
    return assertAccess(isAllowed, as().ref(path).getMetadata());
  });
});

describe('storage files delete', () => {
  const [bruno, ana] = MEMBERS;
  const cases = [
    { ...rowsFor([bruno], 'delete their own file', true)[0], owner: 'uid-bruno', path: 'files/del-owner' },
    { ...rowsFor([ana], 'delete a file of a member', false)[0], owner: 'uid-bruno', path: 'files/del-admin' },
    { ...rowsFor([bruno], 'delete a file of another person', false)[0], owner: 'uid-ana', path: 'files/del-other' },
    { ...rowsFor([bruno], 'delete a file without uploadedBy in the metadata', false)[0], owner: null, path: 'files/del-nometa' },
    ...withPaths(rowsFor(OUTSIDERS, 'delete a file', false, { owner: 'uid-bruno' }), 'del-out'),
  ];

  itEach(cases, async ({ as, path, owner, isAllowed }) => {
    await seedStorageFile(path, new Uint8Array(100), 'image/webp', owner === null ? undefined : { uploadedBy: owner });
    return assertAccess(isAllowed, as().ref(path).delete());
  });
});

// O registro em `files` já existe (semeado): o objeto que falta não pode ser preenchido por outro membro. Cada linha tem o
// seu registro, porque o primeiro envio aceito deixaria o objeto no caminho para a linha seguinte.
describe('storage files upload to the path of an existing file record', () => {
  const paths = ['files/fbruno1', 'files/fana1'];
  const cases = rowsFor(MEMBERS, 'upload to the path of a file record that already exists', false).map((row, index) => ({ ...row, path: paths[index] }));

  itEach(cases, (row) => assertAccess(row.isAllowed, upload(row.as(), row.path, new Uint8Array(100), 'image/webp', row.uid)));
});
