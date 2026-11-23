import {
  cancelAllScheduledNotificationsAsync,
  scheduleNotificationAsync,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import { useEffect } from 'react';

import { billRemindersOf } from '@/features/home/utils/billRemindersOf';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { entryMonthQueryService } from '@/shared/services/entry/query/entryMonthQueryService';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';
import { currentMonth } from '@/shared/utils/date/currentMonth';
import { shiftMonth } from '@/shared/utils/date/shiftMonth';
import { notificationChannels } from '@/shared/utils/notifications/notificationChannels';

// Uma agenda de cada vez: o agendamento de uma agenda velha que terminasse depois do cancelamento da nova deixaria o
// lembrete de uma conta já paga. Fica no módulo, e não na montagem, porque sair e entrar monta o hook de novo.
const scheduleQueue = { last: Promise.resolve() };

/**
 * Agenda neste celular o lembrete de cada conta que vence amanhã, no mês atual e no seguinte. Com as contas e os
 * lançamentos dos dois meses lidos (do servidor ou do cache), cancela os lembretes agendados e agenda de novo os que
 * valem: a agenda é refeita a cada mudança dos dados, e o app só agenda lembretes, então cancelar tudo não apaga outra
 * coisa. Com alguma leitura ainda carregando ou com erro, a agenda fica como está. A falha vai só ao log, porque o
 * lembrete é um extra e a próxima mudança dos dados tenta de novo.
 */
export function useBillReminders() {
  const month = currentMonth();
  const nextMonth = shiftMonth(month, 1);
  const { data: bills } = useRealtime(recurringBillListQueryService, {});
  const { data: entries } = useRealtime(entryMonthQueryService, { month });
  const { data: nextEntries } = useRealtime(entryMonthQueryService, { month: nextMonth });

  useEffect(() => {
    // `data` só existe com a leitura em `success` ou `cached`: carregando ou com erro, a agenda fica como está.
    if (!bills || !entries || !nextEntries) return;
    let isStale = false;

    const reschedule = async () => {
      if (isStale) return;
      await cancelAllScheduledNotificationsAsync();
      if (isStale) return;
      const reminders = billRemindersOf({
        now: new Date(),
        months: [month, nextMonth],
        bills,
        entries: [...entries, ...nextEntries],
      });
      await Promise.all(
        reminders.map(({ identifier, title, body, date }) =>
          scheduleNotificationAsync({
            identifier,
            content: { title, body, data: { url: '/' } },
            trigger: {
              type: SchedulableTriggerInputTypes.DATE,
              date,
              channelId: notificationChannels.billReminders.id,
            },
          }),
        ),
      );
    };

    scheduleQueue.last = scheduleQueue.last
      .then(reschedule)
      .catch((error: unknown) => console.warn('Não deu para agendar os lembretes das contas.', error));
    return () => {
      isStale = true;
    };
  }, [bills, entries, nextEntries, month, nextMonth]);
}
