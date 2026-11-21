import { CircleDashed, type LucideIcon } from 'lucide-react-native';

import type { IColorRole } from '@/core/types/ColorRole';

import { OVERDUE_LOOK } from '@/features/home/constants/overdueLook';
import type { IBillToPay } from '@/features/home/types/BillToPay';
import { fromMonthLabelOf } from '@/features/home/utils/fromMonthLabelOf';
import { Button } from '@/shared/components/Button/Button';
import { ListItem } from '@/shared/components/ListItem/ListItem';
import type { ITag } from '@/shared/types/tag/Tag';
import { monthName } from '@/shared/utils/date/monthName';
import { formatCents } from '@/shared/utils/format/formatCents';

/**
 * Como a linha se desenha em cada estado: o verbo do vencimento, a marca, o texto do selo (nas cores da marca) e o que o
 * "Pagar" diz ao leitor de tela depois do nome: no mês atual, a atrasada e a conta do mês têm o mesmo nome.
 */
const LOOK_BY_STATE: Record<
  NonNullable<IBillToPay['overdue']> | 'onTime',
  {
    dueVerb: string;
    icon: LucideIcon;
    markColor: IColorRole;
    iconColor: IColorRole;
    badgeLabelOf: (billMonth: string) => string | undefined;
    payLabelSuffixOf: (billMonth: string) => string;
  }
> = {
  onTime: {
    dueVerb: 'vence',
    icon: CircleDashed,
    markColor: 'tertiaryContainer',
    iconColor: 'onTertiaryContainer',
    badgeLabelOf: () => undefined,
    payLabelSuffixOf: () => '',
  },
  fromEarlierMonth: {
    dueVerb: 'venceu',
    icon: OVERDUE_LOOK.icon,
    markColor: OVERDUE_LOOK.markColor,
    iconColor: OVERDUE_LOOK.iconColor,
    badgeLabelOf: fromMonthLabelOf,
    payLabelSuffixOf: (billMonth) => ` de ${monthName(billMonth)}`,
  },
  inItsMonth: {
    dueVerb: 'venceu',
    icon: OVERDUE_LOOK.icon,
    markColor: OVERDUE_LOOK.markColor,
    iconColor: OVERDUE_LOOK.iconColor,
    badgeLabelOf: () => OVERDUE_LOOK.badge.label,
    payLabelSuffixOf: () => '',
  },
};

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
  /** O mês da conta ('AAAA-MM'), que dá o texto do selo "De outubro" da atrasada de um mês anterior. */
  billMonth: string;
  /** O estado da conta atrasada, que ganha a marca, o selo e "venceu dia N"; sem ele, a conta é do mês e ainda vence. */
  overdue?: NonNullable<IBillToPay['overdue']>;
  /** Abre o registro do pagamento: a linha inteira e o botão "Pagar" fazem o mesmo. */
  onPress: () => void;
}

/**
 * Uma conta a pagar no mês: a marca `tertiaryContainer`, a bolinha da tag com "R$ 119,90 · vence dia 15" e o botão
 * "Pagar". Com contribuições, o detalhe diz o que falta e de quem elas vieram: "faltam R$ 58,00 · R$ 40,00 de
 * Bruno · dia 20". A atrasada leva a marca `errorContainer` com o relógio, o selo nas mesmas cores ("De outubro" no
 * mês atual, para a conta de um mês anterior, e "Atrasada" no mês dela) e "venceu dia 15".
 */
export function BillToPayItem({
  name,
  remainingCents,
  dueDay,
  contributionsSupport,
  tag,
  billMonth,
  overdue,
  onPress,
}: IBillToPayItemProps) {
  const { dueVerb, icon, markColor, iconColor, badgeLabelOf, payLabelSuffixOf } = LOOK_BY_STATE[overdue ?? 'onTime'];
  const badgeLabel = badgeLabelOf(billMonth);
  const support = contributionsSupport
    ? `faltam ${formatCents(remainingCents)} · ${contributionsSupport} · dia ${dueDay}`
    : `${formatCents(remainingCents)} · ${dueVerb} dia ${dueDay}`;

  return (
    <ListItem
      icon={icon}
      title={name}
      support={support}
      tag={tag}
      badge={badgeLabel ? { label: badgeLabel, background: markColor, color: iconColor } : undefined}
      isCompact
      markColor={markColor}
      iconColor={iconColor}
      trailing={
        <Button
          label="Pagar"
          accessibilityLabel={`Pagar ${name}${payLabelSuffixOf(billMonth)}`}
          variant="tertiary"
          isCompact
          onPress={onPress}
        />
      }
      onPress={onPress}
    />
  );
}
