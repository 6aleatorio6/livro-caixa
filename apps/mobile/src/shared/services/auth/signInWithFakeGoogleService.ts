import { GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';

import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';

/**
 * Entra com uma conta Google inventada, que só o emulador do Auth aceita: no lugar do token vai um
 * JSON com a identidade. O `sub` é o e-mail, para a mesma conta de teste voltar sempre com o mesmo uid.
 */
export async function signInWithFakeGoogleService({ email, name }: { email: string; name: string }) {
  const identity = JSON.stringify({ sub: email, email, email_verified: true, name });
  const { user } = await signInWithCredential(firebaseAuth, GoogleAuthProvider.credential(identity));
  return user;
}
