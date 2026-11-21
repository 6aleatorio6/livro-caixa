import { billMonthQueryService } from '@/shared/services/billMonth/query/billMonthQueryService';
import { billMonthQueryScenarios } from '@/shared/services/billMonth/query/billMonthQueryService.scenarios';
import { overdueSourcesQueryService } from '@/shared/services/billMonth/query/overdueSourcesQueryService';
import { overdueSourcesQueryScenarios } from '@/shared/services/billMonth/query/overdueSourcesQueryService.scenarios';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { mockRealtime } from '@/shared/testing/mockRealtime';
import type { IRealtimeMock } from '@/shared/types/testing/RealtimeMock';

// Os meses de conta de outubro e de novembro de 2026 e as atrasadas lidas em cada um dos dois meses atuais possíveis
// (outubro, o primeiro do app, e novembro). A leitura das atrasadas só roda no mês atual, e a parada (`idle`) atende
// as telas dos outros meses e a leitura sem mês (`month: null`) do que não se lê: vem por último, porque um mock de
// estado atende qualquer leitura do serviço.
const SUMMARY_READS: IRealtimeMock[] = [
  { service: billMonthQueryService, scenario: billMonthQueryScenarios.monthWithoutBillMonths },
  { service: billMonthQueryService, scenario: billMonthQueryScenarios.novemberWithoutBillMonths },
  { service: overdueSourcesQueryService, scenario: overdueSourcesQueryScenarios.noOverdue },
  { service: overdueSourcesQueryService, scenario: overdueSourcesQueryScenarios.octoberUnpaid },
  { service: overdueSourcesQueryService, status: 'idle' },
  { service: billMonthQueryService, status: 'idle' },
  { service: entryMonthQueryService, status: 'idle' },
];

/**
 * O `mockRealtime` com as leituras do resumo do mês (`useMonthSummary`) que o teste não escolhe: os meses de conta e
 * as atrasadas. O `mockRealtime` usa o primeiro mock que atende a leitura, então um mock do teste para o mesmo serviço
 * vem antes e vale no lugar do da lista.
 */
export function mockRealtimeWithSummaryReads(...mocks: IRealtimeMock[]) {
  return mockRealtime(...mocks, ...SUMMARY_READS);
}
