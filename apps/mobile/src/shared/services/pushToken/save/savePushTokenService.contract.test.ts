import { arrangeScenario } from '@/shared/testing/contract/arrangeScenario';
import { readWithoutRules } from '@/shared/testing/contract/readWithoutRules';
import { scenarioEntries } from '@/shared/testing/contract/scenarioEntries';
import { testAccountUid } from '@/shared/testing/testAccountUid';

import { savePushTokenService } from './savePushTokenService';
import { SAVED_PUSH_TOKEN, savePushTokenScenarios } from './savePushTokenService.scenarios';

describe('savePushTokenService', () => {
  it.each(scenarioEntries<[string], void>(savePushTokenScenarios))(
    'Should write the token of the scenario %s with the uid of who is signed in',
    async (_name, scenario) => {
      await arrangeScenario(scenario);

      expect(await savePushTokenService(...scenario.input)).toBe(scenario.result);

      expect(await readWithoutRules(`pushTokens/${scenario.input[0]}`)).toEqual({
        uid: testAccountUid(scenario.signedInAs as string),
      });
    },
  );

  // O celular que muda de dono: quem entra nele grava o mesmo token com o próprio uid.
  it('Should hand the token over to who signs in on the phone after another person', async () => {
    const ana = 'ana.souza@exemplo.com';
    const bruno = 'bruno.souza@exemplo.com';
    await arrangeScenario({
      signedInAs: bruno,
      given: {
        [`allowedEmails/${ana}`]: { name: 'Ana Souza', isAdmin: true, hasEntries: false },
        [`allowedEmails/${bruno}`]: { name: 'Bruno Souza', isAdmin: false, hasEntries: false },
        [`pushTokens/${SAVED_PUSH_TOKEN}`]: { uid: testAccountUid(ana) },
      },
    });

    await savePushTokenService(SAVED_PUSH_TOKEN);

    expect(await readWithoutRules(`pushTokens/${SAVED_PUSH_TOKEN}`)).toEqual({ uid: testAccountUid(bruno) });
  });

  it('Should refuse to save the token without a session', async () => {
    await arrangeScenario({ signedInAs: null, given: {} });

    await expect(savePushTokenService(SAVED_PUSH_TOKEN)).rejects.toThrow(
      'Não há sessão para guardar o token de notificação',
    );

    expect(await readWithoutRules(`pushTokens/${SAVED_PUSH_TOKEN}`)).toBeNull();
  });
});
