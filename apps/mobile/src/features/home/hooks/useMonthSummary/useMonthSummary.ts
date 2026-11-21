import { monthSummary } from '@/features/home/utils/monthSummary';
import { overdueBillsOf } from '@/features/home/utils/overdueBillsOf';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { billMonthQueryService } from '@/shared/services/billMonth/query/billMonthQueryService';
import { overdueSourcesQueryService } from '@/shared/services/billMonth/query/overdueSourcesQueryService';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';

/**
 * As leituras do mês (as contas, os lançamentos e os meses de conta pulados ou pagos depois) e o resumo que sai delas;
 * no mês atual lê também o que decide as atrasadas, e nos outros meses não. `summary` é `null` até as leituras
 * chegarem e `hasError` vale quando uma delas falha. Sem o mês (`month` `null`: a tela ainda não precisa dele), as
 * leituras do mês ficam paradas e `summary` é `null`. O mês atual (`currentMonth`) vem de quem chama, que o congela
 * na abertura da tela: virar o mês com ela aberta não tira as atrasadas.
 */
export function useMonthSummary({ month, currentMonth }: { month: string | null; currentMonth: string }) {
  const isThisMonth = month === currentMonth;
  const { status: billsStatus, data: bills } = useRealtime(recurringBillListQueryService, {});
  const { status: entriesStatus, data: entries } = useRealtime(entryMonthQueryService, { month });
  const { status: billMonthsStatus, data: billMonths } = useRealtime(billMonthQueryService, { month });
  const { status: overdueStatus, data: overdueSources } = useRealtime(overdueSourcesQueryService, {
    currentMonth: isThisMonth ? currentMonth : null,
  });

  const hasError = [billsStatus, entriesStatus, billMonthsStatus, overdueStatus].includes('error');
  const hasReads = month !== null && bills && entries && billMonths && (overdueSources || !isThisMonth);
  const summary = hasReads
    ? monthSummary({
        month,
        currentMonth,
        bills,
        entries,
        billMonths,
        overdueBills: overdueSources ? overdueBillsOf({ bills, currentMonth, ...overdueSources }) : [],
      })
    : null;

  return { bills, summary, hasError };
}
