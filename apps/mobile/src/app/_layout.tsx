import { Stack, type UnknownOutputParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { AppContainer } from '@/core/AppContainer';
import { SplashScreenController } from '@/core/components/SplashScreenController/SplashScreenController';
import { useAccess } from '@/features/auth/hooks/useAccess/useAccess';
import { AppLockedScreen } from '@/features/biometrics/components/AppLockedScreen/AppLockedScreen';
import { useBiometricLock } from '@/features/biometrics/hooks/useBiometricLock/useBiometricLock';
import { useDiscardShareWithoutAccess } from '@/features/home/hooks/useDiscardShareWithoutAccess/useDiscardShareWithoutAccess';
import { useAppVersionLockStore } from '@/shared/store/appVersionLock.store';
import { checkAppVersion } from '@/shared/utils/version/checkAppVersion';

/**
 * O id de tela única que `dangerouslySingular` daria (a rota com os segmentos dinâmicos preenchidos, como
 * `recurring-bills/<id>/pay`), menos no compartilhamento (`shared=1`), que sempre abre uma tela nova: reaproveitar a
 * que já está aberta perderia o comprovante, porque a tela só lê o compartilhado ao abrir.
 */
function singularUnlessShared(name: string, params: UnknownOutputParams) {
  if (params.shared === '1') return undefined;
  return name.replace(/\[(\w+)\]/g, (segment, param: string) => {
    const value = params[param];
    return typeof value === 'string' ? value : segment;
  });
}

export default function RootLayout() {
  const { status: accessStatus, isAdmin } = useAccess();
  useDiscardShareWithoutAccess(accessStatus);
  const requiredVersion = useAppVersionLockStore((state) => state.requiredVersion);
  const isUpdateRequired = requiredVersion !== null;
  // Abaixo do mínimo, nenhuma guarda de acesso abre: só a tela de atualização, até para quem está logado e liberado.
  const guardedStatus = isUpdateRequired ? null : accessStatus;
  const [hasCheckedVersion, setHasCheckedVersion] = useState(false);
  useEffect(() => {
    checkAppVersion().then(() => setHasCheckedVersion(true));
  }, []);
  const isLockedByBiometrics = useBiometricLock();
  // O bloqueio é um `Modal` por cima da pilha, não uma guarda: uma guarda desmontaria as telas abertas e perderia o
  // rascunho de um registro pela metade. Só cobre o app liberado: a tela de atualização e a de entrar ficam na frente,
  // e a conferência da versão termina antes, para o pedido do sistema não abrir por baixo da splash e da atualização.
  const isAppLockVisible = isLockedByBiometrics && hasCheckedVersion && guardedStatus === 'allowed';

  // A splash espera a primeira conferência e, com o app liberado, a sessão: ela cobre a tela de login, que é a única
  // liberada enquanto o acesso carrega. Com o app travado a sessão não conta, a tela de atualização não depende dela.
  return (
    <AppContainer>
      {/* Os ícones da barra seguem o tema do telefone, como o `adaptiveThemes`; o comprovante em tela cheia põe o dele. */}
      <StatusBar style="auto" />
      <SplashScreenController isLoading={!hasCheckedVersion || (!isUpdateRequired && accessStatus === 'loading')} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isUpdateRequired}>
          <Stack.Screen name="update-required" />
        </Stack.Protected>
        <Stack.Protected guard={guardedStatus === 'signedOut' || guardedStatus === 'loading'}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="test-sign-in" />
        </Stack.Protected>
        <Stack.Protected guard={guardedStatus === 'denied'}>
          <Stack.Screen name="no-access" />
        </Stack.Protected>
        <Stack.Protected guard={guardedStatus === 'allowed'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="change-name" dangerouslySingular />
          <Stack.Screen name="recurring-bills/index" />
          <Stack.Screen name="recurring-bills/new" dangerouslySingular />
          <Stack.Screen name="recurring-bills/[id]/index" />
          {/* As telas com `dangerouslySingular` abrem por um toque: dois toques rápidos empilhavam duas (dois leitores
              do comprovante abertos). Com ele, o segundo toque reaproveita a tela já aberta para a mesma rota e os
              mesmos segmentos dinâmicos (o `id`); os parâmetros de busca não contam. As três que o compartilhamento
              também abre usam `singularUnlessShared`. A `share-receipt` fica de fora: reaproveitá-la poderia manter o
              arquivo compartilhado antes. O `receipt-preview` não tem segmento dinâmico, então o arquivo (`uri`) entra
              no id: com um id fixo, o leitor que ficou aberto sob o formulário subiria ao topo com o arquivo novo,
              levando o estado do antigo (a falha, a página). */}
          <Stack.Screen name="recurring-bills/[id]/pay" dangerouslySingular={singularUnlessShared} />
          <Stack.Screen name="one-off-bills/new" dangerouslySingular={singularUnlessShared} />
          <Stack.Screen name="share-receipt" />
          <Stack.Screen
            name="receipt-preview"
            options={{ animation: 'fade' }}
            dangerouslySingular={(name, params) => `${name}:${String(params.uri)}`}
          />
          <Stack.Screen
            name="entries/[id]/index"
            options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
            dangerouslySingular
          />
          <Stack.Screen name="entries/[id]/edit" dangerouslySingular />
          <Stack.Screen name="entries/[id]/contribute" dangerouslySingular={singularUnlessShared} />
          <Stack.Screen name="entries/[id]/receipt" options={{ animation: 'fade' }} dangerouslySingular />
          <Stack.Screen name="tags/index" />
          <Stack.Screen name="tags/new" dangerouslySingular />
          <Stack.Screen name="tags/[id]" />
          <Stack.Protected guard={isAdmin}>
            <Stack.Screen name="allowed-emails" />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
      {isAppLockVisible && <AppLockedScreen />}
    </AppContainer>
  );
}
