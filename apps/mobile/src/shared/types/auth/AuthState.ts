import type { User } from '@react-native-firebase/auth';

/** A sessão do Firebase Auth: carregando no início, até o Firebase dizer se há alguém logado. */
export type IAuthState = { status: 'loading' } | { status: 'signedOut' } | { status: 'signedIn'; user: User };
