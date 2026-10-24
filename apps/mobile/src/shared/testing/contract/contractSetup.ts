import { deleteApp } from 'firebase/app';
import { signOut } from 'firebase/auth';
import { terminate } from 'firebase/firestore';

import { CONTRACT_EMULATORS } from './contractEmulators';
import { contractApp } from './firebase/contractApp';
import { firebaseAuth } from './firebase/firebaseAuth';
import { firestoreDb } from './firebase/firestoreDb';
import { OPEN_READINGS } from './openReadings';
import { rulesTestEnvironment } from './rulesTestEnvironment';

async function deleteAuthAccounts() {
  const accounts = `${CONTRACT_EMULATORS.authUrl}/emulator/v1/projects/${CONTRACT_EMULATORS.projectId}/accounts`;
  const response = await fetch(accounts, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Apagar as contas do emulador do Auth falhou: ${response.status}`);
}

// Cada teste de contrato começa sem sessão, sem contas e com o banco vazio. As contas também saem:
// uma conta que já existe guarda o nome da primeira entrada, e o cenário seguinte receberia esse nome.
beforeEach(async () => {
  // A sessão sai antes das contas: sair com a conta já apagada no emulador pode falhar.
  await signOut(firebaseAuth);
  const environment = await rulesTestEnvironment;
  await Promise.all([deleteAuthAccounts(), environment.clearFirestore()]);
});

afterEach(() => {
  OPEN_READINGS.forEach((stop) => stop());
  OPEN_READINGS.clear();
});

afterAll(async () => {
  await (await rulesTestEnvironment).cleanup();
  await terminate(firestoreDb);
  await deleteApp(contractApp);
});
