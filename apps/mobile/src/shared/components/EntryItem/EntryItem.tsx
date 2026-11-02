import { ListItem } from '@/shared/components/ListItem/ListItem';
import { AppText } from '@/shared/components/AppText/AppText';
import type { IEntryMarkKind } from '@/shared/types/entry/EntryMarkKind';
import type { ITag } from '@/shared/types/tag/Tag';
import { entryMarkOf } from '@/shared/utils/entry/entryMarkOf';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IEntryItemProps {
  /** O tipo do lançamento, que decide a marca. */
  kind: IEntryMarkKind;
  name: string;
  /** O valor pago, em centavos. */
  amountCents: number;
  /** O detalhe da linha, já escrito por quem chama ("dia 5 · Ana"). */
  support: string;
  /** A tag, que abre o detalhe com a bolinha da cor dela (no Início); sem ela, o detalhe vem sozinho. */
  tag?: ITag;
  /** Sem `onPress` a linha é só leitura; com ele é um botão cujo rótulo é o nome do lançamento e o da tag. */
  onPress?: () => void;
}

/**
 * Um lançamento do mês numa lista. A conta avulsa leva a marca `secondaryContainer` e o recibo; o pagamento
 * de uma conta recorrente, a marca `primaryContainer` e o `check`. O detalhe vem pronto: aqui só se desenha
 * a marca, o nome, a bolinha da tag e o valor.
 */
export function EntryItem({ kind, name, amountCents, support, tag, onPress }: IEntryItemProps) {
  const { icon, markColor, iconColor } = entryMarkOf(kind);

  return (
    <ListItem
      icon={icon}
      title={name}
      support={support}
      tag={tag}
      isCompact
      onPress={onPress}
      markColor={markColor}
      iconColor={iconColor}
      trailing={
        <AppText variant="titleMedium" numberOfLines={1}>
          {formatCents(amountCents)}
        </AppText>
      }
    />
  );
}
