import type { ITagColor } from './TagColor';

/** Uma cor do seletor de tags: o nome que a pessoa lê. */
export interface ITagColorOption {
  color: ITagColor;
  /** O nome em pt-BR. */
  label: string;
}
