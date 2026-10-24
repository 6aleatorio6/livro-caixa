import { signOut } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { firebaseAuth } from '@/shared/services/firebase/firebase-auth';

/** Sai do Firebase e do Google: no próximo login, o Google pergunta de novo qual conta usar. */
export async function signOutService() {
  await signOut(firebaseAuth);
  await GoogleSignin.signOut();
}
