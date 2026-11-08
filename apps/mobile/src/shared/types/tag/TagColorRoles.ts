import type { ITagColor } from './TagColor';

/** Os três papéis de uma cor de tag no tema. */
export interface ITagColorRoles {
  /** A cor cheia, como a bolinha do chip e o círculo do ícone na lista. */
  mainRole: `tag${Capitalize<ITagColor>}`;
  /** O fundo suave. */
  containerRole: `tag${Capitalize<ITagColor>}Container`;
  /** O que fica sobre o fundo suave. */
  onContainerRole: `onTag${Capitalize<ITagColor>}Container`;
}
