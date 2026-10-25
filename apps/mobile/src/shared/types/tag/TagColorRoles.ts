import type { ITagColor } from './TagColor';

/** Os três papéis de uma cor de tag no tema. */
export interface ITagColorRoles {
  /** A cor cheia, como a bolinha do chip. */
  mainRole: `tag${Capitalize<ITagColor>}`;
  /** O fundo suave, como o da marca na lista. */
  containerRole: `tag${Capitalize<ITagColor>}Container`;
  /** O que fica sobre o fundo suave. */
  onContainerRole: `onTag${Capitalize<ITagColor>}Container`;
}
