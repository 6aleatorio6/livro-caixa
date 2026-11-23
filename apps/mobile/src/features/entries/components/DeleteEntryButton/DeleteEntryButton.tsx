import { doDeleteEntry } from '@/features/entries/utils/actions/doDeleteEntry';
import { DeleteWithConfirm } from '@/shared/components/DeleteWithConfirm/DeleteWithConfirm';
import type { IAuthoredEntry } from '@/shared/types/entry/AuthoredEntry';
import type { IAuthoredEntryOfKind } from '@/shared/types/entry/AuthoredEntryOfKind';
import type { IEntry } from '@/shared/types/entry/Entry';
import { monthName } from '@/shared/utils/date/monthName';
import { paidBillMonthOf } from '@/shared/utils/entry/paidBillMonthOf';

// O que a confirmação diz de cada tipo de lançamento: o que acontece com o mês e com o comprovante.
const DIALOG_BY_KIND: {
  [TKind in IAuthoredEntry['kind']]: (entry: IAuthoredEntryOfKind<TKind>) => { title: string; message: string };
} = {
  recurringPayment: (entry) => ({
    title: `Excluir o pagamento da ${entry.name}?`,
    message: `A ${entry.name} de ${monthName(paidBillMonthOf(entry))} volta a aparecer como a pagar no Início, e o comprovante é apagado.`,
  }),
  overduePayment: (entry) => ({
    title: `Excluir o pagamento da ${entry.name}?`,
    message: `A ${entry.name} de ${monthName(paidBillMonthOf(entry))} volta a ficar atrasada, e o comprovante é apagado.`,
  }),
  oneOffBill: (entry) => ({
    title: `Excluir a conta avulsa ${entry.name}?`,
    message: 'A conta avulsa sai do mês, e o comprovante é apagado.',
  }),
  contribution: () => ({
    title: 'Excluir a contribuição?',
    message: 'A contribuição sai da conta, e o comprovante é apagado.',
  }),
};

function dialogOf<TKind extends IAuthoredEntry['kind']>(entry: IAuthoredEntryOfKind<TKind>) {
  return DIALOG_BY_KIND[entry.kind as TKind](entry);
}

export interface IDeleteEntryButtonProps {
  entry: IAuthoredEntry;
  /** O rótulo do botão: "Excluir" na folha, "Excluir pagamento" ou "Excluir conta avulsa" na tela de alterar. */
  label: string;
  /** Os lançamentos do mês, que a contribuição precisa: a última de um pagamento sem dono o leva junto. */
  monthEntries?: IEntry[];
  /** Por que não dá para excluir: o botão fica desligado, e o motivo aparece embaixo. */
  disabledReason?: string;
  /** Mostra o motivo embaixo do botão; na linha dos detalhes, a folha o mostra embaixo da linha. */
  shouldShowReason?: boolean;
  /** Desliga o botão sem motivo: a tela ainda não sabe se dá para excluir (os lançamentos do mês não chegaram). */
  disabled?: boolean;
  /** Chamado depois que a exclusão deu certo: cada tela sai do seu jeito. */
  onDeleted: () => void;
}

/** O botão de excluir um lançamento, com a confirmação que diz o que acontece com o mês e com o comprovante. */
export function DeleteEntryButton({
  entry,
  label,
  monthEntries,
  disabledReason,
  shouldShowReason = true,
  disabled = false,
  onDeleted,
}: IDeleteEntryButtonProps) {
  async function deleteEntry() {
    const { error } = await doDeleteEntry({ entry, monthEntries });
    if (!error) onDeleted();
  }

  const dialog = dialogOf(entry);

  return (
    <DeleteWithConfirm
      label={label}
      dialogTitle={dialog.title}
      dialogMessage={dialog.message}
      disabled={disabled || disabledReason !== undefined}
      disabledReason={disabledReason}
      shouldShowReason={shouldShowReason}
      onConfirm={deleteEntry}
    />
  );
}
