import { doDeleteOneOffBill } from '@/features/entries/utils/actions/doDeleteOneOffBill';
import { doDeletePayment } from '@/features/entries/utils/actions/doDeletePayment';
import { DeleteWithConfirm } from '@/shared/components/DeleteWithConfirm/DeleteWithConfirm';
import type { IEntry } from '@/shared/types/entry/Entry';
import { monthName } from '@/shared/utils/date/monthName';

export interface IDeleteEntryButtonProps {
  entry: IEntry;
  /** O rótulo do botão: "Excluir" na folha, "Excluir pagamento" ou "Excluir conta avulsa" na tela de alterar. */
  label: string;
  /** Chamado depois que a exclusão deu certo: cada tela sai do seu jeito. */
  onDeleted: () => void;
}

/** O botão de excluir um lançamento, com a confirmação que diz o que acontece com o mês e com o comprovante. */
export function DeleteEntryButton({ entry, label, onDeleted }: IDeleteEntryButtonProps) {
  const isPayment = entry.kind === 'recurringPayment';

  async function deleteEntry() {
    const { error } = await (isPayment ? doDeletePayment : doDeleteOneOffBill)(entry);
    if (!error) onDeleted();
  }

  return (
    <DeleteWithConfirm
      label={label}
      dialogTitle={isPayment ? `Excluir o pagamento da ${entry.name}?` : `Excluir a conta avulsa ${entry.name}?`}
      dialogMessage={
        isPayment
          ? `A ${entry.name} de ${monthName(entry.month)} volta a aparecer como a pagar no Início, e o comprovante é apagado.`
          : 'A conta avulsa sai do mês, e o comprovante é apagado.'
      }
      onConfirm={deleteEntry}
    />
  );
}
