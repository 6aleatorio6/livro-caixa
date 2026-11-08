import { beforeEach, describe } from 'node:test';

import { getDoc, getDocs, setDoc } from 'firebase/firestore';

import { MEMBERS, OUTSIDERS, asOwner, assertAccess, itEach, rowsFor, settingsDocOf, settingsOf, tagsDocOf } from './setup/index.mjs';

describe('settings get of the tags', () => {
  const cases = [
    ...rowsFor(MEMBERS, 'read the tags', true),
    ...rowsFor(OUTSIDERS, 'read the tags', false),
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDoc(tagsDocOf(as()))));
});

// Só `settings/tags` e `settings/app` são abertos: qualquer outro documento de `settings` continua negado.
describe('settings get of another document', () => {
  beforeEach(() => asOwner((firestore) => setDoc(settingsDocOf(firestore, 'other'), { items: {} })));

  const cases = [
    ...rowsFor(MEMBERS, 'read another settings document', false),
    ...rowsFor(OUTSIDERS, 'read another settings document', false),
  ];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDoc(settingsDocOf(as(), 'other'))));
});

// `settings/app` guarda a versão mínima do app e qualquer um o lê, até sem sessão: a tela de atualização aparece antes do login.
describe('settings get of the app settings', () => {
  beforeEach(() => asOwner((firestore) => setDoc(settingsDocOf(firestore, 'app'), { minVersion: '0.5.0' })));

  const cases = rowsFor([...MEMBERS, ...OUTSIDERS], 'read the app settings', true);

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDoc(settingsDocOf(as(), 'app'))));
});

// Abrir o `get` de `settings/app` não abre a listagem: ninguém lista `settings`, e com ela vazaria o `tags`.
describe('settings list', () => {
  const cases = rowsFor([...MEMBERS, ...OUTSIDERS], 'list the settings', false);

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDocs(settingsOf(as()))));
});
