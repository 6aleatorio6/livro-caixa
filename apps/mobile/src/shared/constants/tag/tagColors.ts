import type { ITagColorOption } from '@/shared/types/tag/TagColorOption';

/** As oito cores que uma tag pode ter, na ordem do seletor do design. */
export const TAG_COLORS = [
  { color: 'wood', label: 'Madeira' },
  { color: 'moss', label: 'Musgo' },
  { color: 'petrol', label: 'Petróleo' },
  { color: 'slate', label: 'Ardósia' },
  { color: 'blue', label: 'Azul' },
  { color: 'indigo', label: 'Anil' },
  { color: 'lavender', label: 'Lavanda' },
  { color: 'plum', label: 'Ameixa' },
] as const satisfies readonly ITagColorOption[];
