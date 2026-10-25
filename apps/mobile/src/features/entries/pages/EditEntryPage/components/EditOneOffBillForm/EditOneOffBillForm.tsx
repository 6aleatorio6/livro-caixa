import { DeleteEntryButton } from '@/features/entries/components/DeleteEntryButton/DeleteEntryButton';
import { OneOffBillForm } from '@/shared/components/OneOffBillForm/OneOffBillForm';
import type { IEntry } from '@/shared/types/entry/Entry';
import type { IUpdateEntryInput } from '@/shared/types/entry/UpdateEntryInput';
import type { IReceiptFile } from '@/shared/types/file/ReceiptFile';
import type { ITag } from '@/shared/types/tag/Tag';

export interface IEditOneOffBillFormProps {
  entry: Extract<IEntry, { kind: 'oneOffBill' }>;
  tags: ITag[];
  hasTagsError: boolean;
  /** O comprovante já salvo: enquanto nenhum arquivo novo for escolhido, ele fica e o campo não é obrigatório. */
  currentReceipt?: IReceiptFile;
  /** Recebe o que o serviço de alterar pede; o formulário fica ocupado até a promessa terminar. */
  onSubmit: (input: IUpdateEntryInput) => Promise<void>;
  /** A exclusão pelo botão do fim da tela deu certo. */
  onDeleted: () => void;
}

/** A alteração da conta avulsa: o formulário do registro, preenchido, e a exclusão no fim. Nome, valor, data, tag e comprovante mudam. */
export function EditOneOffBillForm({
  entry,
  tags,
  hasTagsError,
  currentReceipt,
  onSubmit,
  onDeleted,
}: IEditOneOffBillFormProps) {
  return (
    <OneOffBillForm
      tags={tags}
      hasTagsError={hasTagsError}
      initialValues={{ name: entry.name, amountCents: entry.amountCents, date: entry.date, tagId: entry.tagId }}
      currentReceipt={currentReceipt}
      submitLabel="Salvar alterações"
      dateSupportText="A data define o mês em que a conta entra."
      footer={<DeleteEntryButton entry={entry} label="Excluir conta avulsa" onDeleted={onDeleted} />}
      onSubmit={({ receipt, ...changes }) => onSubmit({ entry, changes, receipt })}
    />
  );
}
