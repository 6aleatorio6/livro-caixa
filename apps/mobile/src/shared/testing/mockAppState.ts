import { AppState, type AppStateStatus } from 'react-native';

/**
 * O `AppState` do Jest é um objeto oco: o `currentState` é um `jest.fn()`, nunca `'active'`. Aqui ele ganha o estado
 * de agora e ouvintes que fazem o que os de verdade fazem: `remove` tira o ouvinte, e o estado muda antes de os
 * ouvintes serem chamados. Chamar de novo recomeça noutro estado, sem os ouvintes anteriores. A mudança é síncrona: quem
 * a dispara a põe dentro de `act`.
 */
export function mockAppState(initialState: AppStateStatus = 'active') {
  const listeners = new Set<(state: AppStateStatus) => void>();
  Object.assign(AppState, { currentState: initialState });

  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    const changeListener = listener as (state: AppStateStatus) => void;
    listeners.add(changeListener);
    return {
      remove: () => {
        listeners.delete(changeListener);
      },
    };
  });

  return {
    /** O sistema muda o estado do app, e quem ainda ouve recebe o novo estado. */
    change(state: AppStateStatus) {
      Object.assign(AppState, { currentState: state });
      [...listeners].forEach((listener) => listener(state));
    },
  };
}
