import { monthName } from '@/shared/utils/date/monthName';
import { formatCents } from '@/shared/utils/format/formatCents';
import type { INotifiedEntry } from '@/shared/types/notifications/NotifiedEntry';

function monthTitleOf(month: string) {
  const name = monthName(month);

  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

/**
 * O texto da notificação de um lançamento e a rota que o toque abre: "Bruno pagou a Água" com "Novembro · R$ 98,00", a
 * conta avulsa com o nome no lugar do mês. A contribuição abre o lançamento que a recebe, não a si mesma.
 */
export function entryNotificationOf(entry: INotifiedEntry, senderName: string) {
  switch (entry.kind) {
    case 'recurringPayment':
    case 'overduePayment':
      return {
        title: `${senderName} pagou a ${entry.name}`,
        body: `${monthTitleOf(entry.month)} · ${formatCents(entry.amountCents)}`,
        url: `/entries/${entry.id}`,
      };
    case 'oneOffBill':
      return {
        title: `${senderName} registrou uma conta avulsa`,
        body: `${entry.name} · ${formatCents(entry.amountCents)}`,
        url: `/entries/${entry.id}`,
      };
    case 'contribution':
      return {
        title: `${senderName} contribuiu na ${entry.name}`,
        body: `${monthTitleOf(entry.month)} · ${formatCents(entry.amountCents)}`,
        url: `/entries/${entry.targetId}`,
      };
  }
}
