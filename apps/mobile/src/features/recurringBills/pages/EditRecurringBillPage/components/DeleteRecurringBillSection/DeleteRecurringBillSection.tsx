import { DeleteWithConfirm } from '@/shared/components/DeleteWithConfirm/DeleteWithConfirm';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';

import { doRemoveRecurringBill } from '@/features/recurringBills/utils/actions/doRemoveRecurringBill';

export interface IDeleteRecurringBillSectionProps {
  bill: IRecurringBill;
  /** Chamado depois que a conta foi excluída. */
  onDeleted: () => void;
}

/** A exclusão da conta: o botão abre a confirmação e, confirmada, a conta sai. */
export function DeleteRecurringBillSection({ bill, onDeleted }: IDeleteRecurringBillSectionProps) {
  async function removeBill() {
    const { error } = await doRemoveRecurringBill({ id: bill.id });
    if (!error) onDeleted();
  }

  return (
    <DeleteWithConfirm
      label="Excluir conta"
      dialogTitle={`Excluir a conta ${bill.name}?`}
      dialogMessage="Ela deixa de aparecer como a pagar nos meses sem pagamento. Os pagamentos já registrados continuam."
      onConfirm={removeBill}
    />
  );
}
