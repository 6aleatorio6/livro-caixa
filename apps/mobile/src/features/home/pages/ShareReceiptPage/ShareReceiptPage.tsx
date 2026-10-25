import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useSharedReceipt } from '@/features/home/hooks/useSharedReceipt/useSharedReceipt';
import { ReceiptSummary } from '@/shared/components/ReceiptSummary/ReceiptSummary';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { clearSharedReceipt } from '@/shared/utils/sharedReceipt/clearSharedReceipt';

import { SharedBillChoices } from './components/SharedBillChoices/SharedBillChoices';

/**
 * Onde cai quem compartilha uma imagem ou um PDF de outro app: o comprovante que chegou e a lista das contas a
 * pagar do mês atual, com "Conta avulsa" por último. Escolher a conta segue no pagamento com o comprovante anexado.
 */
export function ShareReceiptPage() {
  const { theme } = useUnistyles();
  const shared = useSharedReceipt();

  // O comprovante guardado vale enquanto esta tela está na pilha: o `x`, o voltar do sistema e o registro do
  // pagamento (que tira a tela com `dismissTo`) a desmontam do mesmo jeito.
  useEffect(() => clearSharedReceipt, []);

  // Rota aberta sem compartilhamento (à mão, ou com o arquivo já usado): não há o que escolher aqui.
  useEffect(() => {
    if (shared.status === 'empty') router.dismissTo('/');
  }, [shared.status]);

  return (
    <Screen>
      <TopBar title="Qual conta você pagou?" icon="close" onBack={() => router.dismissTo('/')} />
      <ScreenContent gap="extraLarge">
        {shared.status === 'resolving' ? (
          <ActivityIndicator accessibilityLabel="Lendo o arquivo" style={styles.loader} color={theme.colors.primary} />
        ) : null}
        {/* A recusa não tem arquivo para mostrar: a linha de erro leva a mensagem e o que a pessoa faz. */}
        {shared.status === 'rejected' ? (
          <ReceiptSummary file={null} errorMessage={shared.message} rejectedFileName="Compartilhe outro arquivo." />
        ) : null}
        {shared.status === 'ready' ? <ReceiptSummary file={shared.receipt} isShared /> : null}
        {shared.status === 'ready' ? <SharedBillChoices /> : null}
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { alignSelf: 'center' },
});
