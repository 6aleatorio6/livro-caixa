import { router } from 'expo-router';

import { AppText } from '@/shared/components/AppText/AppText';
import { Screen } from '@/shared/components/Screen/Screen';
import { ScreenContent } from '@/shared/components/Screen/ScreenContent';
import { TopBar } from '@/shared/components/TopBar/TopBar';
import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';

import { ChangeNameForm } from './components/ChangeNameForm/ChangeNameForm';

/** Onde cada membro troca o próprio nome, o que a família vê nos lançamentos e na divisão por membro. */
export function ChangeNamePage() {
  const email = signedInEmail(useAuthState());
  const { status, data: person } = useRealtime(allowedEmailQueryService, { email });

  return (
    <Screen>
      <TopBar title="Seu nome" />
      <ScreenContent>
        {/* O formulário começa com o nome atual: só aparece com a leitura respondida, do servidor ou do aparelho. */}
        {(status === 'success' || status === 'cached') && person && email ? (
          <ChangeNameForm email={email} currentName={person.name ?? ''} onSaved={() => router.back()} />
        ) : null}
        {status === 'error' ? (
          <AppText variant="bodyMedium" color="onSurfaceVariant">
            Não deu para carregar o seu nome.
          </AppText>
        ) : null}
      </ScreenContent>
    </Screen>
  );
}
