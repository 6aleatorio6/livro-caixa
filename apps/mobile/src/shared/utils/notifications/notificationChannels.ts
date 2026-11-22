import { AndroidImportance } from 'expo-notifications';

/** Os canais de notificação do Android: cada um aparece com o próprio nome nos ajustes do app. */
export const notificationChannels = {
  entries: { id: 'entries', name: 'Lançamentos', importance: AndroidImportance.DEFAULT },
  billReminders: { id: 'billReminders', name: 'Vencimentos', importance: AndroidImportance.DEFAULT },
} as const;
