import { onAuthStateChanged } from '@react-native-firebase/auth';

import { firebaseAuth } from '@/shared/services/firebase/firebaseAuth';
import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';

import { signOutService } from './signOutService';
import { signOutScenarios } from './signOutService.scenarios';

// O Google Sign-In é nativo: o contrato confere a saída do Firebase.
jest.mock('@react-native-google-signin/google-signin', () => ({ GoogleSignin: { signOut: jest.fn() } }));

describe('signOutService', () => {
  it.each(scenarioEntries(signOutScenarios))(
    'Should end the session the app listens to in %s',
    async (_name, scenario) => {
      await arrangeScenario(scenario);
      // O `useAuthState` escuta o `onAuthStateChanged`: a saída tem de chegar a ele como `null`.
      const sessionEnded = new Promise<void>((resolve) => {
        const stop = onAuthStateChanged(firebaseAuth, (user) => {
          if (user) return;
          stop();
          resolve();
        });
      });

      expect(await signOutService(...scenario.input)).toBe(scenario.result);
      await sessionEnded;
    },
  );
});
