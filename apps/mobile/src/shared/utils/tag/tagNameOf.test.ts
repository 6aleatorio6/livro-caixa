import type { ITag } from '@/shared/types/tag/Tag';

import { tagNameOf } from './tagNameOf';

const tags: ITag[] = [{ id: 'casa', name: 'Casa', nameKey: 'casa', color: 'wood' }];

describe('tagNameOf', () => {
  it('Should give the name of the tag', () => {
    expect(tagNameOf('casa', tags)).toBe('Casa');
  });

  it('Should give nothing without a tag', () => {
    expect(tagNameOf(null, tags)).toBeUndefined();
  });

  it('Should give nothing for a tag that is not in the list', () => {
    expect(tagNameOf('apagada', tags)).toBeUndefined();
  });

  it('Should give nothing while the tags are not loaded', () => {
    expect(tagNameOf('casa', null)).toBeUndefined();
  });
});
