import { Check, Receipt } from 'lucide-react-native';

import { ListItem } from '@/shared/components/ListItem/ListItem';
import { AppText } from '@/shared/components/AppText/AppText';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IEntryItemProps {
  /** O tipo do lançamento, que decide a marca: a conta avulsa (`oneOff`) ou o pagamento de uma conta recorrente (`payment`). */
  kind: 'oneOff' | 'payment';
  name: string;
  /** O valor pago, em centavos. */
  amountCents: number;
  /** O detalhe da linha, já escrito por quem chama ("dia 5 · Ana · Casa"). */
  support: string;
}

/**
 * Um lançamento do mês numa lista. A conta avulsa leva a marca `secondaryContainer` e o recibo; o pagamento
 * de uma conta recorrente, a marca `primaryContainer` e o `check`. O detalhe vem pronto: aqui só se desenha
 * a marca, o nome e o valor. A linha é só leitura.
 */
export function EntryItem({ kind, name, amountCents, support }: IEntryItemProps) {
  const isPayment = kind === 'payment';

  return (
    <ListItem
      icon={isPayment ? Check : Receipt}
      title={name}
      support={support}
      isCompact
      markColor={isPayment ? 'primaryContainer' : 'secondaryContainer'}
      iconColor={isPayment ? 'onPrimaryContainer' : 'onSecondaryContainer'}
      trailing={
        <AppText variant="titleMedium" numberOfLines={1}>
          {formatCents(amountCents)}
        </AppText>
      }
    />
  );
}
