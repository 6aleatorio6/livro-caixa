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

describe('memberChoicesOf', () => {
  it('Should put "Você" first, then the others by first name', () => {
    expect(memberChoicesOf([clara, ana, bruno], 'uid-bruno')).toEqual([
      { uid: 'uid-bruno', name: 'Você' },
      { uid: 'uid-ana', name: 'Ana' },
      { uid: 'uid-clara', name: 'Clara' },
    ]);
  });

  it('Should leave out who never entered the app', () => {
    expect(memberChoicesOf([ana, elisa], 'uid-ana')).toEqual([{ uid: 'uid-ana', name: 'Você' }]);
  });

  it('Should offer only "Você" while the list of people loads', () => {
    expect(memberChoicesOf([], 'uid-bruno')).toEqual([{ uid: 'uid-bruno', name: 'Você' }]);
  });
});
