import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';

import { memberNamesOf } from './memberNamesOf';

const person = (uid: string, name: string): IAllowedEmailListItem => ({
  email: `${uid}@example.com`,
  name,
  uid,
  isAdmin: false,
  hasEntries: true,
});
const people = [person('ana', 'Ana Souza'), person('bruno', 'Bruno Lima'), person('carla', 'Carla Dias')];

describe('memberNamesOf', () => {
  it('Should write a single first name alone', () => {
    expect(memberNamesOf(['bruno'], people)).toBe('Bruno');
  });

  it('Should join the last two names with "e" and the others with commas, without repeating a person', () => {
    expect(memberNamesOf(['ana', 'bruno', 'ana', 'carla'], people)).toBe('Ana, Bruno e Carla');
  });
});
