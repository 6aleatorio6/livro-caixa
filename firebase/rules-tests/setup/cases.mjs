import { it } from 'node:test';

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

import { OUTSIDERS, signedInAs } from './profiles.mjs';

/**
 * Uma linha por perfil para a mesma operação: `action` completa o título ("read the tags") e `rest`
 * são os campos que a linha carrega (`data`, `id`).
 */
export function rowsFor(profiles, action, isAllowed, rest = {}) {
  return profiles.map(({ who, as, uid }) => ({ title: `Should${isAllowed ? '' : ' not'} let ${who} ${action}`, as, uid, isAllowed, ...rest }));
}

/**
 * Os perfis de `entries.update` e `entries.delete`: só o autor (Bruno) mexe no lançamento dele; outro membro
 * no do outro, o admin no de um membro e quem está fora são recusados. `rest` são os campos de cada linha.
 */
export function entryRowsFor(action, rest = {}, ids = { own: 'bruno1', other: 'ana1' }) {
  const author = { who: 'the author', as: () => signedInAs('bruno@gmail.com') };
  const other = { who: 'a member, on the entry of another person,', as: () => signedInAs('bruno@gmail.com') };
  const admin = { who: 'the admin, on the entry of a member,', as: () => signedInAs('ana@gmail.com') };
  return [
    ...rowsFor([author], `${action} the entry`, true, { id: ids.own, ...rest }),
    ...rowsFor([other], `${action} the entry`, false, { id: ids.other, ...rest }),
    ...rowsFor([admin], `${action} the entry`, false, { id: ids.own, ...rest }),
    ...rowsFor(OUTSIDERS, `${action} an entry`, false, { id: ids.own, ...rest }),
  ];
}

/** O caso é liberado (`true`) ou recusado (`false`) pelas regras. */
export function assertAccess(isAllowed, operation) {
  return isAllowed ? assertSucceeds(operation) : assertFails(operation);
}

/**
 * Um `it` por linha da tabela: o `node:test` não tem `it.each`. O título de cada linha diz o que ela
 * prova, e `run` recebe a linha.
 */
export function itEach(rows, run) {
  for (const row of rows) it(row.title, () => run(row));
}
