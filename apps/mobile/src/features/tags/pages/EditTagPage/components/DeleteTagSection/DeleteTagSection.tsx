import { DeleteWithConfirm } from '@/shared/components/DeleteWithConfirm/DeleteWithConfirm';
import type { ITag } from '@/shared/types/tag/Tag';
import { recurringBillCount } from '@/shared/utils/format/recurringBillCount';

import { doRemoveTag } from '@/features/tags/utils/actions/doRemoveTag';

export interface IDeleteTagSectionProps {
  tag: ITag;
  /** Quantas contas recorrentes usam a tag: com uma só, a tag não sai. */
  usedByCount: number;
  /** Chamado depois que a tag foi excluída. */
  onDeleted: () => void;
}

/** A exclusão da tag: sem uso, pede a confirmação; em uso, o botão fica desligado e o texto diz o motivo. */
export function DeleteTagSection({ tag, usedByCount, onDeleted }: IDeleteTagSectionProps) {
  async function removeTag() {
    const { error } = await doRemoveTag({ id: tag.id });
    if (!error) onDeleted();
  }

  return (
    <DeleteWithConfirm
      label="Excluir tag"
      dialogTitle={`Excluir a tag ${tag.name}?`}
      dialogMessage="Ela sai da lista de tags. Nenhuma conta usa esta tag."
      disabled={usedByCount > 0}
      disabledReason={`A tag ${tag.name} está em ${recurringBillCount(usedByCount)}. Para excluir, tire a tag delas.`}
      onConfirm={removeTag}
    />
  );
}
