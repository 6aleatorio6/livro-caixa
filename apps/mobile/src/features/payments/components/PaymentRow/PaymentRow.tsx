import { router } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { EntryItem } from '@/shared/components/EntryItem/EntryItem';
import { entryMarkKindOf } from '@/shared/utils/entry/entryMarkKindOf';
import type { IAllowedEmailListItem } from '@/shared/types/allowedEmail/AllowedEmailListItem';

import type { IPaymentRow } from '../../types/PaymentRow';
import { PaymentPartLine } from '../PaymentPartLine/PaymentPartLine';
import { partLabelOf } from '../../utils/partLabelOf';
import { paymentEntrySupportOf } from '../../utils/paymentEntrySupportOf';

export interface IPaymentRowProps {
  row: IPaymentRow;
  people: IAllowedEmailListItem[];
  /** O membro do chip escolhido; `null` em "Todos", que mostra a conta sem as partes. */
  chosenUid: string | null;
  /** Quem está logado: a parte dele se chama "Sua parte". */
  signedInUid: string | null;
}

/**
 * Uma conta na lista de Pagamentos: a linha do lançamento, que abre os detalhes dele, e, no chip de um membro, as
 * partes embaixo quando a conta tem contribuições: a do membro em destaque, depois a dos outros. A parte que é uma
 * contribuição abre os detalhes dela.
 */
export function PaymentRow({ row, people, chosenUid, signedInUid }: IPaymentRowProps) {
  const { entry, amountCents, parts } = row;
  // Com contribuições, as partes aparecem: a contribuição única de um mês sem dono também, que só abre por aqui.
  const isExpanded = chosenUid !== null && parts.some(({ contribution }) => contribution !== null);

  return (
    <View>
      <EntryItem
        kind={entryMarkKindOf(entry)}
        name={entry.name}
        amountCents={amountCents}
        onPress={() => router.push({ pathname: '/entries/[id]', params: { id: entry.id } })}
        support={paymentEntrySupportOf(row, people, chosenUid)}
      />
      {isExpanded ? (
        <View style={styles.parts}>
          {/* A parte do membro escolhido vem primeiro; a ordem estável mantém a de quem pagou antes das contribuições. */}
          {[...parts]
            .sort((a, b) => Number(b.uid === chosenUid) - Number(a.uid === chosenUid))
            .map((part) => (
              <PaymentPartLine
                key={part.contribution?.id ?? `payer-${part.uid}`}
                part={part}
                label={partLabelOf(part, people, chosenUid, signedInUid)}
                isHighlighted={part.uid === chosenUid}
              />
            ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // A margem da esquerda alinha as partes ao nome da conta, depois da marca: a medida do design, sem token.
  parts: {
    gap: theme.spacing.extraSmall,
    paddingLeft: 72,
    paddingRight: theme.spacing.large,
    paddingBottom: theme.spacing.small,
  },
}));
