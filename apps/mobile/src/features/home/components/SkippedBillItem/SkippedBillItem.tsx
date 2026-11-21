import { SkipForward } from 'lucide-react-native';

import { ListItem } from '@/shared/components/ListItem/ListItem';
import type { ITag } from '@/shared/types/tag/Tag';

export interface ISkippedBillItemProps {
  name: string;
  /** O nome de quem pulou o mês da conta. */
  skippedByName: string;
  /** A tag da conta, com a bolinha da cor dela no detalhe; o leitor de tela lê o nome. */
  tag?: ITag;
  /** Abre o registro do pagamento do mês pulado, para desfazer o pulo: a linha inteira é o toque. */
  onPress: () => void;
}

/**
 * Uma conta de mês pulado: a marca `surfaceContainerHigh` com o `skip-forward` e o nome apagados, "pulada por Ana ·
 * não conta no mês" no detalhe e sem valor, porque o mês não entra na conta.
 */
export function SkippedBillItem({ name, skippedByName, tag, onPress }: ISkippedBillItemProps) {
  return (
    <ListItem
      icon={SkipForward}
      title={name}
      titleColor="onSurfaceVariant"
      support={`pulada por ${skippedByName} · não conta no mês`}
      tag={tag}
      markColor="surfaceContainerHigh"
      iconColor="onSurfaceVariant"
      isCompact
      onPress={onPress}
    />
  );
}
