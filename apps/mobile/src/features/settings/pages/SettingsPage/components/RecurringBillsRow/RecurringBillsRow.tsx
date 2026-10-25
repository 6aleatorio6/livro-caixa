import { router } from 'expo-router';
import { Repeat } from 'lucide-react-native';

import { ListItem } from '@/shared/components/ListItem/ListItem';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { recurringBillListQueryService } from '@/shared/services/recurringBill/query/recurringBillListQueryService';

import { recurringBillsSupport } from '@/features/settings/utils/recurringBillsSupport';

/** A linha "Contas recorrentes" de Configurações, com a própria leitura: a página não renderiza de novo a cada mudança das contas. */
export function RecurringBillsRow() {
  const { data: bills } = useRealtime(recurringBillListQueryService, {});

  return (
    <ListItem
      icon={Repeat}
      title="Contas recorrentes"
      support={bills ? recurringBillsSupport(bills) : undefined}
      onPress={() => router.push('/recurring-bills')}
    />
  );
}
