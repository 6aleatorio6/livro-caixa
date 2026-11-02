import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import type { IMemberPart } from '@/shared/types/entry/MemberPart';
import { formatCents } from '@/shared/utils/format/formatCents';

export interface IPaymentPartLineProps {
  part: IMemberPart;
  /** "Sua parte", "Bruno · contribuição", "Ana · pagou a conta". */
  label: string;
  /** A parte do membro do chip: o texto em `onSurface`, e não em `onSurfaceVariant`. */
  isHighlighted: boolean;
}

/** Uma parte embaixo da conta, em Pagamentos: quem e quanto. A parte que é uma contribuição abre os detalhes dela. */
export function PaymentPartLine({ part, label, isHighlighted }: IPaymentPartLineProps) {
  const color = isHighlighted ? 'onSurface' : 'onSurfaceVariant';
  const line = (
    <>
      <AppText variant="bodySmall" color={color} style={styles.label}>
        {label}
      </AppText>
      <AppText variant="bodySmall" color={color}>
        {formatCents(part.amountCents)}
      </AppText>
    </>
  );
  if (!part.contribution) return <View style={styles.line}>{line}</View>;

  const contributionId = part.contribution.id;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${formatCents(part.amountCents)}`}
      onPress={() => router.push({ pathname: '/entries/[id]', params: { id: contributionId } })}
      style={styles.line}
    >
      {line}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  line: { flexDirection: 'row', gap: theme.spacing.small },
  label: { flex: 1 },
}));
