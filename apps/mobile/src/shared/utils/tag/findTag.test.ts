import type { ITag } from '@/shared/types/tag/Tag';

import { findTag } from './findTag';

const casa: ITag = { id: 'casa', name: 'Casa', nameKey: 'casa', color: 'wood' };

describe('findTag', () => {
  it('Should give the tag of the id', () => {
    expect(findTag('casa', [casa])).toBe(casa);
  });

  it('Should give nothing without a tag', () => {
    expect(findTag(null, [casa])).toBeUndefined();
  });

  it('Should give nothing for a tag that is not in the list', () => {
    expect(findTag('apagada', [casa])).toBeUndefined();
  });

  it('Should give nothing while the tags are not loaded', () => {
    expect(findTag('casa', null)).toBeUndefined();
  });
});
