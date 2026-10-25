import { Repeat } from 'lucide-react-native';

import { AppText } from '@/shared/components/AppText/AppText';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IBillItemProps {
  name: string;
  /** O valor previsto da conta, em centavos. */
  amountCents: number;
  /** O dia do vencimento, de 1 a 31. */
  dayOfMonth: number;
  /** O nome da tag; sem ele a linha mostra só o dia. */
  tagName?: string;
  /** Sem `onPress` a linha é só leitura: não é um botão. */
  onPress?: () => void;
}

/** Uma conta recorrente numa lista: a marca neutra, o nome, "todo dia 5 · Casa" e o valor previsto à direita. */
export function BillItem({ name, amountCents, dayOfMonth, tagName, onPress }: IBillItemProps) {
  const detail = tagName ? `todo dia ${dayOfMonth} · ${tagName}` : `todo dia ${dayOfMonth}`;

  return (
    <ListItem
      icon={Repeat}
      title={name}
      support={detail}
      isCompact
      markColor="surfaceContainerHigh"
      iconColor="onSurfaceVariant"
      trailing={
        <AppText variant="titleMedium" numberOfLines={1}>
          {formatCents(amountCents)}
        </AppText>
      }
      onPress={onPress}
    />
  );
}
