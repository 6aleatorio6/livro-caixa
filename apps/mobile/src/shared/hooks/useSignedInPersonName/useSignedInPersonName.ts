import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { useRealtime } from '@/shared/hooks/useRealtime/useRealtime';
import { allowedEmailQueryService } from '@/shared/services/allowedEmail/query/allowedEmailQueryService';
import { signedInEmail } from '@/shared/utils/auth/signedInEmail';
import { displayNameOf } from '@/shared/utils/person/displayNameOf';
import { firstNameOf } from '@/shared/utils/person/firstNameOf';

/** O primeiro nome de quem está logado (o e-mail inteiro, se a pessoa ainda não tem nome); `null` sem sessão. */
export function useSignedInPersonName() {
  const email = signedInEmail(useAuthState());
  const { data: person } = useRealtime(allowedEmailQueryService, { email });

  return email ? firstNameOf(displayNameOf({ name: person?.name ?? null, email })) : null;
}
