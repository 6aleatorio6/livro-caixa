import { CircleDashed } from 'lucide-react-native';

import { Button } from '@/shared/components/Button/Button';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import type { ITag } from '@/shared/types/tag/Tag';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IBillToPayItemProps {
  name: string;
  /** O valor previsto, em centavos. */
  expectedCents: number;
  /** O dia do vencimento no mês, de 1 a 31. */
  dueDay: number;
  /** A tag, que abre o detalhe com a bolinha da cor dela; o leitor de tela lê o nome. */
  tag?: ITag;
  /** Abre o registro do pagamento: a linha inteira e o botão "Registrar" fazem o mesmo. */
  onPress: () => void;
}

/** Uma conta a pagar no mês: a marca `tertiaryContainer`, a bolinha da tag com "R$ 119,90 · vence dia 15" e o botão "Registrar". */
export function BillToPayItem({ name, expectedCents, dueDay, tag, onPress }: IBillToPayItemProps) {
  return (
    <ListItem
      icon={CircleDashed}
      title={name}
      support={`${formatCents(expectedCents)} · vence dia ${dueDay}`}
      tag={tag}
      isCompact
      markColor="tertiaryContainer"
      iconColor="onTertiaryContainer"
      trailing={
        <Button
          label="Registrar"
          accessibilityLabel={`Registrar ${name}`}
          variant="tertiary"
          isCompact
          onPress={onPress}
        />
      }
      onPress={onPress}
    />
  );
}
