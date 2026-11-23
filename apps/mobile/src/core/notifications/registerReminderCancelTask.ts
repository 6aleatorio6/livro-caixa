import { cancelScheduledNotificationAsync, registerTaskAsync } from 'expo-notifications';
import { defineTask } from 'expo-task-manager';

const REMINDER_CANCEL_TASK = 'reminderCancelTask';

/**
 * Cancela o lembrete de uma conta quando chega a mensagem silenciosa `cancelReminder` (o id do pagamento, que é o do
 * lembrete): o celular que não abriu o app depois do pagamento deixaria de avisar de uma conta já paga. A mensagem
 * silenciosa chega sem notificação (`notification: null`), com os dados em `data.dataString`, que é o JSON dos dados
 * da mensagem. Outros dados são ignorados.
 */
defineTask<{ data?: { dataString?: string }; notification: null }>(REMINDER_CANCEL_TASK, async ({ data, error }) => {
  if (error || !data.data?.dataString) return;

  const { cancelReminder } = JSON.parse(data.data.dataString) as { cancelReminder?: unknown };
  if (typeof cancelReminder === 'string') await cancelScheduledNotificationAsync(cancelReminder);
});

registerTaskAsync(REMINDER_CANCEL_TASK).catch((error: unknown) =>
  console.warn('Não deu para registrar o cancelamento dos lembretes.', error),
);
