import type { ITagColor } from '@/shared/types/tag/TagColor';
import type { ITagColorRoles } from '@/shared/types/tag/TagColorRoles';

/** Os papéis da cor no tema: `wood` é `tagWood`, `tagWoodContainer` e `onTagWoodContainer`. */
export function tagColorRoles(color: ITagColor): ITagColorRoles {
  const name = `${color[0].toUpperCase()}${color.slice(1)}` as Capitalize<ITagColor>;
  return { mainRole: `tag${name}`, containerRole: `tag${name}Container`, onContainerRole: `onTag${name}Container` };
}
