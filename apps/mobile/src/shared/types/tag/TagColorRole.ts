import type { ITagColor } from './TagColor';

/** O papel de uma cor de tag no tema: a cor cheia, como a bolinha do chip e o círculo do ícone na lista. */
export type ITagColorRole = `tag${Capitalize<ITagColor>}`;
