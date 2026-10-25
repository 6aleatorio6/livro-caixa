import { DeleteWithConfirm } from '@/shared/components/DeleteWithConfirm/DeleteWithConfirm';
import type { ITag } from '@/shared/types/tag/Tag';

import { doRemoveTag } from '@/features/tags/utils/actions/doRemoveTag';

export interface IDeleteTagSectionProps {
  tag: ITag;
  /** Os trechos do uso da tag ("2 contas recorrentes", "1 conta avulsa"): com algum, a tag não sai. */
  parts: string[];
  /** Chamado depois que a tag foi excluída. */
  onDeleted: () => void;
}

/** A exclusão da tag: sem uso, pede a confirmação; em uso, o botão fica desligado e o texto diz o motivo. */
export function DeleteTagSection({ tag, parts, onDeleted }: IDeleteTagSectionProps) {
  async function removeTag() {
    const { error } = await doRemoveTag({ id: tag.id });
    if (!error) onDeleted();
  }

  // Uma conta só no total (um único trecho, "1 …"): "dela"; mais de uma, "delas".
  const accountsPronoun = parts.length === 1 && parts[0].startsWith('1 ') ? 'dela' : 'delas';

  return (
    <DeleteWithConfirm
      label="Excluir tag"
      dialogTitle={`Excluir a tag ${tag.name}?`}
      dialogMessage="Ela sai da lista de tags. Nenhuma conta usa esta tag."
      disabled={parts.length > 0}
      disabledReason={`A tag ${tag.name} está em ${parts.join(' e ')}. Para excluir, tire a tag ${accountsPronoun}.`}
      onConfirm={removeTag}
    />
  );
}
