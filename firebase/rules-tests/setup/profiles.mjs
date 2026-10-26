import { testEnvironment } from './environment.mjs';

// O `uid` do login é o da pessoa (`uid-ana` para ana@gmail.com), a não ser que o teste dê outro.
function uidOf(email) {
  return `uid-${email.split('@')[0].toLowerCase()}`;
}

export function signedInAs(email, uid = uidOf(email)) {
  return testEnvironment.authenticatedContext(uid, { email, email_verified: true }).firestore();
}

export function signedInWithUnverifiedEmail(email) {
  return testEnvironment.authenticatedContext(uidOf(email), { email, email_verified: false }).firestore();
}

export function signedOut() {
  return testEnvironment.unauthenticatedContext().firestore();
}

/** Quem está fora: sem sessão, com o e-mail não verificado ou fora da lista. Tudo é recusado. */
export const OUTSIDERS = [
  { who: 'a signed-out person', as: () => signedOut() },
  { who: 'a person with an unverified e-mail', as: () => signedInWithUnverifiedEmail('bruno@gmail.com') },
  { who: 'a person outside the list', as: () => signedInAs('carla@gmail.com') },
];

/** Quem está na lista: Bruno (membro) e Ana (admin). */
export const MEMBERS = [
  { who: 'a member', as: () => signedInAs('bruno@gmail.com') },
  { who: 'the admin', as: () => signedInAs('ana@gmail.com') },
];
