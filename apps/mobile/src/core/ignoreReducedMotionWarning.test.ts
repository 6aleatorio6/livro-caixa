import { LogBox } from 'react-native';

import './ignoreReducedMotionWarning';

jest.mock('react-native', () => ({ LogBox: { ignoreLogs: jest.fn() } }));

describe('ignoreReducedMotionWarning', () => {
  // O módulo roda ao ser importado, antes do teste: o aviso tem de estar na lista desde a entrada do app.
  it('Should tell the LogBox to ignore the Reanimated reduced motion warning in development', () => {
    expect(LogBox.ignoreLogs).toHaveBeenCalledWith([expect.stringContaining('Reduced motion setting is enabled')]);
  });
});
