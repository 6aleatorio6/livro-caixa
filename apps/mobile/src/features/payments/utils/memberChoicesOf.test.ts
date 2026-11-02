import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';

import { memberChoicesOf } from './memberChoicesOf';

const person = (email: string, name: string | null, uid: string | null): IAllowedEmailListItem => ({
  email,
  name,
  uid,
  isAdmin: false,
  hasEntries: false,
});
const ana = person('ana@exemplo.com', 'Ana Souza', 'uid-ana');
const bruno = person('bruno@exemplo.com', 'Bruno Souza', 'uid-bruno');
const clara = person('clara@exemplo.com', 'Clara Lima', 'uid-clara');
// A Elisa foi adicionada à lista e ainda não entrou: não tem nome, uid nem lançamento.
const elisa = person('elisa@exemplo.com', null, null);

const EVERYONE = { kind: 'everyone', key: 'everyone', name: 'Todos' };
const member = (uid: string, name: string) => ({ kind: 'member', key: uid, uid, name });

describe('memberChoicesOf', () => {
  it('Should put "Todos" first, then "Você" and the others by first name', () => {
    expect(memberChoicesOf([clara, ana, bruno], 'uid-bruno')).toEqual([
      EVERYONE,
      member('uid-bruno', 'Você'),
      member('uid-ana', 'Ana'),
      member('uid-clara', 'Clara'),
    ]);
  });

  it('Should leave out who never entered the app', () => {
    expect(memberChoicesOf([ana, elisa], 'uid-ana')).toEqual([
      EVERYONE,
      member('uid-ana', 'Você'),
    ]);
  });

  it('Should offer only "Todos" and "Você" while the list of people loads', () => {
    expect(memberChoicesOf([], 'uid-bruno')).toEqual([
      EVERYONE,
      member('uid-bruno', 'Você'),
    ]);
  });
});
