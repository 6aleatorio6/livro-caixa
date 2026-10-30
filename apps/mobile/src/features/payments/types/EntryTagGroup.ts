import type { IEntry } from '@/shared/types/entry/Entry';
import type { ITag } from '@/shared/types/tag/Tag';

/** Os lançamentos de uma tag e o total deles; `tag: null` é o grupo do que não tem tag. */
export interface IEntryTagGroup {
  tag: ITag | null;
  totalCents: number;
  entries: IEntry[];
}
