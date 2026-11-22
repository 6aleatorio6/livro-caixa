import { beforeEach, describe } from 'node:test';

import { deleteDoc, getDoc, getDocs, setDoc } from 'firebase/firestore';

import {
  MEMBERS,
  OUTSIDERS,
  asOwner,
  assertAccess,
  itEach,
  pushTokenDocOf,
  pushTokensOf,
  rowsFor,
  signedInAs,
  signedInWithUnverifiedEmail,
  signedOut,
} from './setup/index.mjs';

// Os tokens semeados: um de cada pessoa, com o `uid` de quem entrou naquele celular (Carla, fora da lista, também).
const BRUNO_TOKEN = 'ExponentPushToken[bruno-phone]';
const ANA_TOKEN = 'ExponentPushToken[ana-phone]';
const CARLA_TOKEN = 'ExponentPushToken[carla-phone]';
const NEW_TOKEN = 'ExponentPushToken[new-phone]';

beforeEach(() =>
  asOwner(async (firestore) => {
    await setDoc(pushTokenDocOf(firestore, BRUNO_TOKEN), { uid: 'uid-bruno' });
    await setDoc(pushTokenDocOf(firestore, ANA_TOKEN), { uid: 'uid-ana' });
    await setDoc(pushTokenDocOf(firestore, CARLA_TOKEN), { uid: 'uid-carla' });
  }),
);

const bruno = () => signedInAs('bruno@gmail.com');
const ana = () => signedInAs('ana@gmail.com');

describe('pushTokens create', () => {
  // `as` é quem grava, `token` é o documento e `data` o que ele leva.
  const cases = [
    { title: 'Should let a member save a new token with their own uid', as: bruno, token: NEW_TOKEN, data: { uid: 'uid-bruno' }, isAllowed: true },
    { title: 'Should let the admin save a new token with their own uid', as: ana, token: NEW_TOKEN, data: { uid: 'uid-ana' }, isAllowed: true },
    { title: 'Should not let a member save a token with the uid of another person', as: bruno, token: NEW_TOKEN, data: { uid: 'uid-ana' }, isAllowed: false },
    { title: 'Should not let a member save a token with an extra field', as: bruno, token: NEW_TOKEN, data: { uid: 'uid-bruno', name: 'Bruno' }, isAllowed: false },
    { title: 'Should not let a member save a token without the uid', as: bruno, token: NEW_TOKEN, data: {}, isAllowed: false },
    { title: 'Should not let a person outside the list save a token with their own uid', as: () => signedInAs('carla@gmail.com'), token: NEW_TOKEN, data: { uid: 'uid-carla' }, isAllowed: false },
    { title: 'Should not let a person with an unverified e-mail save a token with their own uid', as: () => signedInWithUnverifiedEmail('bruno@gmail.com'), token: NEW_TOKEN, data: { uid: 'uid-bruno' }, isAllowed: false },
    { title: 'Should not let a signed-out person save a token', as: signedOut, token: NEW_TOKEN, data: { uid: 'uid-bruno' }, isAllowed: false },
  ];

  itEach(cases, ({ as, token, data, isAllowed }) => assertAccess(isAllowed, setDoc(pushTokenDocOf(as(), token), data)));
});

// O celular que troca de dono: quem entra nele grava o mesmo token com o próprio `uid`.
describe('pushTokens update', () => {
  const cases = [
    { title: 'Should let a member take over the token of another person with their own uid', as: bruno, token: ANA_TOKEN, data: { uid: 'uid-bruno' }, isAllowed: true },
    { title: 'Should not let a member change their token to the uid of another person', as: bruno, token: BRUNO_TOKEN, data: { uid: 'uid-ana' }, isAllowed: false },
    { title: 'Should not let a member add a field to their token', as: bruno, token: BRUNO_TOKEN, data: { uid: 'uid-bruno', name: 'Bruno' }, isAllowed: false },
    { title: 'Should not let a person outside the list take over a token', as: () => signedInAs('carla@gmail.com'), token: BRUNO_TOKEN, data: { uid: 'uid-carla' }, isAllowed: false },
  ];

  itEach(cases, ({ as, token, data, isAllowed }) => assertAccess(isAllowed, setDoc(pushTokenDocOf(as(), token), data)));
});

describe('pushTokens delete', () => {
  const cases = [
    { title: 'Should let a member delete their own token', as: bruno, token: BRUNO_TOKEN, isAllowed: true },
    { title: 'Should let the admin delete their own token', as: ana, token: ANA_TOKEN, isAllowed: true },
    { title: 'Should not let a member delete the token of another person', as: bruno, token: ANA_TOKEN, isAllowed: false },
    { title: 'Should not let a person outside the list delete their own token', as: () => signedInAs('carla@gmail.com'), token: CARLA_TOKEN, isAllowed: false },
    { title: 'Should not let a person with an unverified e-mail delete their own token', as: () => signedInWithUnverifiedEmail('bruno@gmail.com'), token: BRUNO_TOKEN, isAllowed: false },
    { title: 'Should not let a signed-out person delete a token', as: signedOut, token: BRUNO_TOKEN, isAllowed: false },
  ];

  itEach(cases, ({ as, token, isAllowed }) => assertAccess(isAllowed, deleteDoc(pushTokenDocOf(as(), token))));
});

describe('pushTokens get', () => {
  const cases = [...rowsFor(MEMBERS, 'read a token', true), ...rowsFor(OUTSIDERS, 'read a token', false)];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDoc(pushTokenDocOf(as(), BRUNO_TOKEN))));
});

describe('pushTokens list', () => {
  const cases = [...rowsFor(MEMBERS, 'list the tokens', true), ...rowsFor(OUTSIDERS, 'list the tokens', false)];

  itEach(cases, ({ as, isAllowed }) => assertAccess(isAllowed, getDocs(pushTokensOf(as()))));
});
