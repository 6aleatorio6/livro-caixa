import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useSharedReceiptOpening } from '@/shared/hooks/useSharedReceiptOpening/useSharedReceiptOpening';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import { doAddContribution } from '@/shared/utils/actions/doAddContribution';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { contributionsSupportOf } from '@/shared/utils/entry/contributionsSupportOf';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { findTag } from '@/shared/utils/tag/findTag';

import { isMonthToPay } from '@/features/home/utils/isMonthToPay';
import { PayRecurringBillForm } from '@/features/home/components/PayRecurringBillForm/PayRecurringBillForm';
import { doPayRecurringBill } from '@/features/home/utils/actions/doPayRecurringBill';

/** Onde qualquer membro registra o pagamento de uma conta recorrente no mês que o Início abriu. */
export function PayRecurringBillPage() {
  // `attach=1`: o "Anexar o comprovante da conta" dos detalhes, que paga o mês que as contribuições já pagaram.
  const { id, month, attach } = useLocalSearchParams<{ id: string; month: string; attach?: string }>();
  const { initialReceipt, finish } = useSharedReceiptOpening();
  const { status, data: bills } = useRealtime(recurringBillListQueryService, {});
  const { data: tags } = useRealtime(tagListQueryService, {});
  // Do envio até a tela voltar: o próprio pagamento chega pela leitura do mês, e a tela não o toma por outro.
  const [isSubmitted, setIsSubmitted] = useState(false);
  const bill = bills?.find((candidate) => candidate.id === id);
  const isToPay = bill ? isMonthToPay(bill, month) : false;
  // O mês da rota pode ser qualquer texto: sem um mês que se paga, a leitura é a do mês atual, e o resultado não vale.
  const { status: entriesStatus, data: entries } = useRealtime(entryMonthQueryService, {
    month: isToPay ? month : currentMonth(),
  });
  const { data: people } = useRealtime(allowedEmailListQueryService, {});
  // O pagamento do mês, com dono ou sem, e as contribuições nele: o mês está pago com o dono, ou quando elas alcançam o
  // previsto do mês, como no Início.
  const payment = entries?.find(
    (entry): entry is Extract<IBillEntry, { kind: 'recurringPayment' }> =>
      entry.kind === 'recurringPayment' && entry.recurringBillId === id,
  );
  const contributions = payment && entries ? contributionsOf(payment.id, entries) : [];
  const contributedCents = sumCents(contributions);
  // O mês com contribuições não segue mais a conta: o nome, o vencimento, o previsto e a tag são as cópias do pagamento
  // sem dono, que o pagamento mantém ao ganhar o dono.
  const monthBill =
    bill && payment?.paidBy === null
      ? {
          ...bill,
          name: payment.name,
          dayOfMonth: payment.dueDay,
          expectedAmountCents: payment.expectedAmountCents,
          tagId: payment.tagId,
        }
      : bill;
  const isPaid =
    isToPay &&
    payment !== undefined &&
    (payment.paidBy !== null || (attach !== '1' && isFullyContributed(payment, entries ?? [])));

  return (
    <Screen>
      <TopBar title="Registrar pagamento" />
      <ScreenContent>
        {bill && !isToPay ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Esta conta não está a pagar neste mês.
          </AppText>
        ) : null}
        {isPaid && !isSubmitted ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Esta conta já foi paga neste mês.
          </AppText>
        ) : null}
        {monthBill && isToPay && entries && (isSubmitted || !isPaid) ? (
          <PayRecurringBillForm
            bill={monthBill}
            month={month}
            expectedCents={monthBill.expectedAmountCents}
            contributedCents={contributedCents}
            contributionsSupport={contributionsSupportOf(contributions, people ?? [])}
            tag={findTag(monthBill.tagId, tags)}
            initialValues={{ receipt: initialReceipt }}
            onSubmit={async (input, isContribution) => {
              setIsSubmitted(true);
              const { error } = isContribution
                ? await doAddContribution({
                    target: { bill: monthBill, month },
                    amountCents: input.amountCents,
                    receipt: input.receipt,
                  })
                : await doPayRecurringBill(input);
              if (error) setIsSubmitted(false);
              else finish();
            }}
          />
        ) : null}
        {/* Só o servidor diz que a conta não existe mais: a lista do aparelho pode estar atrasada. */}
        {status === 'success' && !bill ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Esta conta não existe mais.
          </AppText>
        ) : null}
        {status === 'error' || entriesStatus === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a conta.
          </AppText>
        ) : null}
      </ScreenContent>
    </Screen>
  );
}
