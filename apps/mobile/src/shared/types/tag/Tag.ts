import type { ITagColor } from './TagColor';

/** Uma tag da família, guardada como item do mapa `items` de `settings/tags`; o `id` é a chave do item. */
export interface ITag {
  id: string;
  name: string;
  /** O nome sem espaços nas pontas, sem acentos e em minúsculas (`tagNameKey`): dois nomes com a mesma chave são a mesma tag. */
  nameKey: string;
  color: ITagColor;
}
