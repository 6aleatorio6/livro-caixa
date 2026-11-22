import { Bell } from 'lucide-react-native';
import { Linking } from 'react-native';

import { ListItem } from '@/shared/components/ListItem/ListItem';

/**
 * A linha "Notificações" de Configurações: leva aos ajustes do Android para o app, onde a pessoa liga ou desliga os
 * avisos e escolhe por canal. O app não guarda essa opção.
 */
export function NotificationsRow() {
  return (
    <ListItem
      icon={Bell}
      title="Notificações"
      support="Abre os ajustes do Android para o app"
      onPress={() => {
        Linking.openSettings().catch((error: unknown) =>
          console.warn('Não deu para abrir os ajustes do Android para o app.', error),
        );
      }}
    />
  );
}
