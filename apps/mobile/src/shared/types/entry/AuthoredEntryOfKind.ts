import type { IAuthoredEntry } from '@/shared/types/entry/AuthoredEntry';

/** O lançamento de um só tipo (`kind`), para a tabela que diz algo de cada tipo receber o lançamento já estreitado. */
export type IAuthoredEntryOfKind<TKind extends IAuthoredEntry['kind']> = Extract<IAuthoredEntry, { kind: TKind }>;
