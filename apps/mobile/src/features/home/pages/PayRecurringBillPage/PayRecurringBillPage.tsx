import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useSharedReceiptOpening } from '@/shared/hooks/useSharedReceiptOpening/useSharedReceiptOpening';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { tagListQueryService } from '@/shared/services/tag/query/tagListQueryService';
import { currentMonth } from '@/shared/utils/date/currentMonth';

import { isMonthToPay } from '@/features/home/utils/isMonthToPay';
import { PayRecurringBillForm } from '@/features/home/components/PayRecurringBillForm/PayRecurringBillForm';
import { doPayRecurringBill } from '@/features/home/utils/actions/doPayRecurringBill';

/** Onde qualquer membro registra o pagamento de uma conta recorrente no mês que o Início abriu. */
export function PayRecurringBillPage() {
  const { id, month } = useLocalSearchParams<{ id: string; month: string }>();
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
  const isPaid = isToPay && entries?.some((entry) => entry.kind === 'recurringPayment' && entry.recurringBillId === id);

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
        {bill && isToPay && entries && (isSubmitted || !isPaid) ? (
          <PayRecurringBillForm
            bill={bill}
            month={month}
            tag={tags?.find((candidate) => candidate.id === bill.tagId)}
            initialValues={{ receipt: initialReceipt }}
            onSubmit={async (input) => {
              setIsSubmitted(true);
              const { error } = await doPayRecurringBill(input);
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
