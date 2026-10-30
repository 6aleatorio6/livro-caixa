import type { IColorRole } from '@/core/types/ColorRole';
import type { ITag } from '@/shared/types/tag/Tag';

import { tagColorRoles } from './tagColorRoles';

/** Como uma linha ou um grupo de tag aparece: a chave, o nome e a cor. Sem tag (`null`), "Sem tag", na cor neutra. */
export function tagDisplayOf(tag: ITag | null): { key: string; name: string; color: IColorRole } {
  return tag
    ? { key: tag.id, name: tag.name, color: tagColorRoles(tag.color).mainRole }
    : { key: 'untagged', name: 'Sem tag', color: 'outline' };
}
