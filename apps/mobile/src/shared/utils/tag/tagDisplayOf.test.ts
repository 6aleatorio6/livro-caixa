import type { ITag } from '@/shared/types/tag/Tag';

import { tagDisplayOf } from './tagDisplayOf';

describe('tagDisplayOf', () => {
  it('Should show a tag by its id, name and main color', () => {
    const home: ITag = { id: 'casa', name: 'Casa', nameKey: 'casa', color: 'wood' };

    expect(tagDisplayOf(home)).toEqual({ key: 'casa', name: 'Casa', color: 'tagWood' });
  });

  it('Should show what has no tag as "Sem tag", in the neutral outline color', () => {
    expect(tagDisplayOf(null)).toEqual({ key: 'untagged', name: 'Sem tag', color: 'outline' });
  });
});
