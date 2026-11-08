import type { ITagColor } from '@/shared/types/tag/TagColor';
import type { ITagColorRole } from '@/shared/types/tag/TagColorRole';

/** O papel da cor no tema: `wood` é `tagWood`. */
export function tagColorRole(color: ITagColor): ITagColorRole {
  const name = `${color[0].toUpperCase()}${color.slice(1)}` as Capitalize<ITagColor>;
  return `tag${name}`;
}
