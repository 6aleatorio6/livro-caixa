import { compareNewestFirst } from './compareNewestFirst';

const at = (iso: string) => ({ toMillis: () => new Date(iso).getTime() });

function sorted(entries: { name: string; date: string | null; createdAt: ReturnType<typeof at> | null }[]) {
  return [...entries].sort(compareNewestFirst).map(({ name }) => name);
}

describe('compareNewestFirst', () => {
  it('Should put the later date first', () => {
    const entries = [
      { name: 'old', date: '2026-10-05', createdAt: at('2026-10-25T10:00:00Z') },
      { name: 'new', date: '2026-10-20', createdAt: at('2026-10-21T10:00:00Z') },
    ];

    expect(sorted(entries)).toEqual(['new', 'old']);
  });

  it('Should put the last one launched first on the same date, whatever the names', () => {
    const entries = [
      { name: 'Estacionamento', date: '2026-10-12', createdAt: at('2026-10-12T09:00:00Z') },
      { name: 'Farmácia', date: '2026-10-12', createdAt: at('2026-10-12T18:00:00Z') },
    ];

    expect(sorted(entries)).toEqual(['Farmácia', 'Estacionamento']);
  });

  it('Should treat the entry the server has not stamped yet as the newest of its date', () => {
    const entries = [
      { name: 'stamped', date: '2026-10-12', createdAt: at('2026-10-12T18:00:00Z') },
      { name: 'pending', date: '2026-10-12', createdAt: null },
    ];

    expect(sorted(entries)).toEqual(['pending', 'stamped']);
    expect(sorted([...entries].reverse())).toEqual(['pending', 'stamped']);
  });
});
