import { Receipt } from 'lucide-react-native';

import { AppText } from '@/shared/components/AppText/AppText';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IEntryItemProps {
  name: string;
  /** O valor do lançamento, em centavos. */
  amountCents: number;
  /** A data da conta, 'AAAA-MM-DD'. */
  date: string;
  /** O nome da tag; sem ele o detalhe não a cita. */
  tagName?: string;
}

/**
 * Um lançamento do mês numa lista. Por ora só a conta avulsa: marca `secondaryContainer`, o recibo e
 * "12/10 · avulsa · Casa". Sem `onPress`, é só leitura (os detalhes chegam depois).
 */
export function EntryItem({ name, amountCents, date, tagName }: IEntryItemProps) {
  const [, month, day] = date.split('-');
  const detail = tagName ? `avulsa · ${tagName}` : 'avulsa';

  return (
    <ListItem
      icon={Receipt}
      title={name}
      support={`${day}/${month} · ${detail}`}
      isCompact
      markColor="secondaryContainer"
      iconColor="onSecondaryContainer"
      trailing={
        <AppText variant="titleMedium" numberOfLines={1}>
          {formatCents(amountCents)}
        </AppText>
      }
    />
  );
}
