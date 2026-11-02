import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';
import type { IBillEntry } from '@/shared/types/entry/BillEntry';
import type { IEntry } from '@/shared/types/entry/Entry';
import { contributionsOf } from '@/shared/utils/entry/contributionsOf';
import { contributionsSupportOf } from '@/shared/utils/entry/contributionsSupportOf';
import { paymentTailOf } from '@/shared/utils/entry/paymentTailOf';
import { formatDayMonth } from '@/shared/utils/date/formatDayMonth';
import { memberNameOf } from '@/shared/utils/person/memberNameOf';
import { memberNamesOf } from '@/shared/utils/person/memberNamesOf';

/**
 * O detalhe da linha de uma conta paga no Início, sem a tag (a linha a mostra como bolinha): o pagamento,
 * "dia 5 · Ana" (o vencimento, quem pagou e o previsto, se o pago foi outro valor); a conta avulsa,
 * "12/10 · avulsa · Bruno". Com contribuições, quanto veio delas e de quem toma o lugar do previsto ("dia 10 · Ana ·
 * R$ 40,00 de Bruno"); a conta paga só pelas contribuições diz quem contribuiu ("dia 5 · Bruno e Carla").
 */
export function homeEntrySupportOf(entry: IBillEntry, entries: IEntry[], people: IAllowedEmailListItem[]) {
  const contributions = contributionsOf(entry.id, entries);
  if (entry.paidBy === null)
    return [
      `dia ${entry.dueDay}`,
      memberNamesOf(
        contributions.map(({ paidBy }) => paidBy),
        people,
      ),
    ].join(' · ');

  const memberName = memberNameOf(entry.paidBy, people);
  const parts =
    entry.kind === 'recurringPayment'
      ? [`dia ${entry.dueDay}`, memberName, contributionsSupportOf(contributions, people) ?? paymentTailOf(entry)]
      : [formatDayMonth(entry.date), 'avulsa', memberName, contributionsSupportOf(contributions, people)];

  return parts.filter(Boolean).join(' · ');
}
