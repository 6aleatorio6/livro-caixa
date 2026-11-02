import type { ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/shared/components/AppText/AppText';
import { Button } from '@/shared/components/Button/Button';

export interface IReceiptProblemProps {
  /** O texto do problema; pode ser o de outra peça (a do lançamento), que herda a cor e o alinhamento. */
  message: ReactNode;
  /** Com ele aparece o "Tentar de novo"; sem ele (o arquivo não existe) tentar de novo não adianta. */
  onRetry?: () => void;
}

/** O que a tela do comprovante diz quando não há o que mostrar. */
export function ReceiptProblem({ message, onRetry }: IReceiptProblemProps) {
  return (
    <View style={styles.problem}>
      <AppText variant="bodyMedium" color="onSurfaceVariant" style={styles.message}>
        {message}
      </AppText>
      {onRetry ? <Button label="Tentar de novo" variant="text" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  problem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.small,
    padding: theme.spacing.extraLarge,
  },
  message: { textAlign: 'center' },
}));
