import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useSharedReceiptOpening } from '@/shared/hooks/useSharedReceiptOpening/useSharedReceiptOpening';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailListQueryService } from '@/shared/services/allowedEmail/query/allowedEmailListQueryService';
import { overdueMonthQueryService } from '@/shared/services/overdueMonth/query/overdueMonthQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IRecurringPaymentInput } from '@/shared/types/entry/RecurringPaymentInput';
import type { IRecurringBill } from '@/shared/types/recurringBill/RecurringBill';
import { doAddContribution } from '@/shared/utils/actions/doAddContribution';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { contributionsSupportOf } from '@/shared/utils/entry/contributionsSupportOf';
import { isFullyContributed } from '@/shared/utils/entry/isFullyContributed';
import { sumCents } from '@/shared/utils/entry/sumCents';
import { findTag } from '@/shared/utils/tag/findTag';

import { isMonthToPay } from '@/features/home/utils/isMonthToPay';
import { PayRecurringBillForm } from '@/features/home/components/PayRecurringBillForm/PayRecurringBillForm';
import { doPayOverdueBill } from '@/features/home/utils/actions/doPayOverdueBill';
import { doPayRecurringBill } from '@/features/home/utils/actions/doPayRecurringBill';
import { doSkipOverdueMonth } from '@/features/home/utils/actions/doSkipOverdueMonth';

/** Onde qualquer membro registra o pagamento de uma conta recorrente no mês que o Início abriu. */
export function PayRecurringBillPage() {
  // `attach=1`: o "Anexar o comprovante da conta" dos detalhes, que paga o mês que as contribuições já pagaram.
  const { id, month, attach, shared } = useLocalSearchParams<{
    id: string;
    month: string;
    attach?: string;
    shared?: string;
  }>();
  const { initialReceipt, finish } = useSharedReceiptOpening();
  const { status, data: bills } = useRealtime(recurringBillListQueryService, {});
  const { data: tags } = useRealtime(tagListQueryService, {});
  // Do envio até a tela voltar: o próprio pagamento chega pela leitura do mês, e a tela não o toma por outro.
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Do "Pular" confirmado até a tela voltar: o botão fica ocupado e não abre a confirmação de novo.
  const [isSkipping, setIsSkipping] = useState(false);
  const bill = bills?.find((candidate) => candidate.id === id);
  const isToPay = bill ? isMonthToPay(bill, month) : false;
  const isEarlierMonth = isToPay && month < currentMonth();
  // O mês de conta (pulado ou pago depois) só existe num mês anterior; nos outros a leitura fica parada.
  const { status: overdueMonthsStatus, data: overdueMonths } = useRealtime(overdueMonthQueryService, {
    month: isEarlierMonth ? month : null,
  });
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
  // A atrasada é a conta de um mês anterior ao atual que ainda não tem pagamento, e que se paga no mês de hoje. Com
  // contribuições o mês segue o caminho de sempre: o pagamento é do mês dela, e não há o que pular.
  const isOverdue = isEarlierMonth && payment === undefined;
  const overdueMonthStatus = overdueMonths?.find((candidate) => candidate.recurringBillId === id)?.status;
  const isPaidLater = isOverdue && overdueMonthStatus === 'paidLater';
  // Quem chega pelo compartilhar veio pagar com o comprovante: pular fecharia a tela e o perderia.
  const canSkip = isOverdue && overdueMonthStatus !== 'skipped' && shared !== '1';
  // Os meses de conta só decidem a atrasada (paga depois, pulada): o formulário espera por eles só nela, ou a atrasada
  // paga abriria sem saber. Num mês anterior com contribuições, eles não decidem nada.
  const hasOverdueMonths = !isOverdue || Boolean(overdueMonths);
  const isAlreadyPaid = isPaid || isPaidLater;

  async function skipMonth(billToSkip: IRecurringBill, monthToSkip: string) {
    setIsSkipping(true);
    const { error } = await doSkipOverdueMonth({ bill: billToSkip, month: monthToSkip });
    if (error) {
      setIsSkipping(false);
      return;
    }
    finish();
  }

  async function register(input: IRecurringPaymentInput, isContribution: boolean) {
    if (isOverdue) {
      const { month: billMonth, ...overdueInput } = input;
      return doPayOverdueBill({ ...overdueInput, billMonth });
    }
    if (isContribution) {
      return doAddContribution({
        target: { bill: input.bill, month: input.month },
        amountCents: input.amountCents,
        receipt: input.receipt,
      });
    }
    return doPayRecurringBill(input);
  }

  return (
    <Screen>
      <TopBar title="Registrar pagamento" />
      <ScreenContent>
        {bill && !isToPay ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Esta conta não está a pagar neste mês.
          </AppText>
        ) : null}
        {isAlreadyPaid && !isSubmitted ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            {isPaidLater ? 'Esta conta já foi paga.' : 'Esta conta já foi paga neste mês.'}
          </AppText>
        ) : null}
        {monthBill && isToPay && entries && hasOverdueMonths && (isSubmitted || !isAlreadyPaid) ? (
          <PayRecurringBillForm
            bill={monthBill}
            month={month}
            expectedCents={monthBill.expectedAmountCents}
            contributedCents={contributedCents}
            contributionsSupport={contributionsSupportOf(contributions, people ?? [])}
            tag={findTag(monthBill.tagId, tags)}
            isOverdue={isOverdue}
            // O mês já pulado abre como atrasada, para ser pago, e não pode ser pulado de novo.
            onSkip={canSkip ? () => skipMonth(monthBill, month) : undefined}
            isSkipping={isSkipping}
            initialValues={{ receipt: initialReceipt }}
            onSubmit={async (input, isContribution) => {
              setIsSubmitted(true);
              const { error } = await register(input, isContribution);
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
        {status === 'error' || entriesStatus === 'error' || overdueMonthsStatus === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar a conta.
          </AppText>
        ) : null}
      </ScreenContent>
    </Screen>
  );
}
