import { CircleDashed } from 'lucide-react-native';

import { Button } from '@/shared/components/Button/Button';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import type { ITag } from '@/shared/types/tag/Tag';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IBillToPayItemProps {
  name: string;
  /** O que falta pagar, em centavos: o previsto, ou o previsto menos as contribuições. */
  remainingCents: number;
  /** O dia do vencimento no mês, de 1 a 31. */
  dueDay: number;
  /** Quanto veio de contribuições e de quem ("R$ 40,00 de Bruno"); sem contribuições, nada. */
  contributionsSupport?: string;
  /** A tag, que abre o detalhe com a bolinha da cor dela; o leitor de tela lê o nome. */
  tag?: ITag;
  /** Abre o registro do pagamento: a linha inteira e o botão "Registrar" fazem o mesmo. */
  onPress: () => void;
}

/**
 * Uma conta a pagar no mês: a marca `tertiaryContainer`, a bolinha da tag com "R$ 119,90 · vence dia 15" e o botão
 * "Registrar". Com contribuições, o detalhe diz o que falta e de quem elas vieram: "faltam R$ 58,00 · R$ 40,00 de
 * Bruno · dia 20".
 */
export function BillToPayItem({
  name,
  remainingCents,
  dueDay,
  contributionsSupport,
  tag,
  onPress,
}: IBillToPayItemProps) {
  const support = contributionsSupport
    ? `faltam ${formatCents(remainingCents)} · ${contributionsSupport} · dia ${dueDay}`
    : `${formatCents(remainingCents)} · vence dia ${dueDay}`;

  return (
    <ListItem
      icon={CircleDashed}
      title={name}
      support={support}
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
