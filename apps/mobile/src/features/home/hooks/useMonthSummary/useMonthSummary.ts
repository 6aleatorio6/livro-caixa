import { monthSummary } from '@/features/home/utils/monthSummary';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';

/**
 * As leituras do mês (as contas e os lançamentos) e o resumo que sai delas: `summary` é `null` até as duas chegarem
 * e `hasError` vale quando uma delas falha.
 */
export function useMonthSummary(month: string) {
  const { status: billsStatus, data: bills } = useRealtime(recurringBillListQueryService, {});
  const { status: entriesStatus, data: entries } = useRealtime(entryMonthQueryService, { month });

  const hasError = billsStatus === 'error' || entriesStatus === 'error';
  const summary = bills && entries ? monthSummary({ month, bills, entries }) : null;

  return { bills, summary, hasError };
}
