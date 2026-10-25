import { GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';

import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';

/**
 * Entra no Firebase com a conta Google que a pessoa escolher. Devolve `null` quando ela fecha o
 * seletor de contas: desistir não é erro.
 */
export async function signInWithGoogleService() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;
  const credential = GoogleAuthProvider.credential(response.data.idToken);
  const { user } = await signInWithCredential(firebaseAuth, credential);
  return user;
}
