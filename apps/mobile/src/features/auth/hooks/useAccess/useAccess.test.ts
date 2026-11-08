import { onSnapshot } from '@react-native-firebase/firestore';
import { act, renderHook } from '@testing-library/react-native';

import { useAuthState } from '@/shared/hooks/useAuthState/useAuthState';
import { allowedEmailQueryScenarios } from '@/shared/services/allowedEmail/query/allowedEmailQueryService.scenarios';
import { signInWithFakeGoogleScenarios } from '@/shared/services/auth/signInWithFakeGoogleService.scenarios';
import { signedInAuthState } from '@/shared/testing/signedInAuthState';
import { useAccess } from './useAccess';

jest.mock('@react-native-firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  doc: jest.fn((_db: unknown, ...segments: string[]) => ({ path: segments.join('/') })),
}));
jest.mock('@/shared/services/firebase/firestoreDb', () => ({ firestoreDb: {} }));
jest.mock('@/shared/hooks/useAuthState/useAuthState', () => ({ useAuthState: jest.fn() }));

// O Bruno está na lista (`emailInList`) e o admin o tira dela com o app aberto (`emailRemovedWhileOpen`).
const memberInTheList = allowedEmailQueryScenarios.emailInList;
const memberRemoved = allowedEmailQueryScenarios.emailRemovedWhileOpen;
const [entryAfterRemoval] = Object.values(memberRemoved.afterChange.write);

let deliver: (snapshot: unknown) => void;
let fail: (error: Error) => void;

function documentSnapshot(id: string, data: object | null) {
  return { id, exists: () => data !== null, data: () => data, metadata: { fromCache: false } };
}

async function failTheRead() {
  // Um deploy de regras que nega por um instante: a leitura da lista falha.
  await act(async () => fail(Object.assign(new Error('permission-denied'), { code: 'firestore/permission-denied' })));
}

async function deliverEntryOf(scenario: { signedInAs: string; given: Record<string, object> }) {
  const [entry] = Object.values(scenario.given);
  await act(async () => deliver(documentSnapshot(scenario.signedInAs, entry)));
}

// A primeira leitura só falha, e passados os 30 s a pessoa está na tela de sem acesso.
async function renderDeniedAccess() {
  const hook = await renderHook(() => useAccess());
  await failTheRead();
  await act(async () => jest.advanceTimersByTime(30000));
  return hook;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
  (onSnapshot as jest.Mock).mockImplementation(
    (_ref, _options, onNext: (snapshot: unknown) => void, onError: (error: Error) => void) => {
      // Como o SDK: depois de cancelada, uma escuta não entrega mais nada.
      let isClosed = false;
      deliver = (snapshot) => {
        if (!isClosed) onNext(snapshot);
      };
      fail = onError;
      return jest.fn(() => {
        isClosed = true;
      });
    },
  );
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useAccess', () => {
  it.each([
    {
      description: 'the member',
      inTheList: allowedEmailQueryScenarios.emailInList,
      signIn: signInWithFakeGoogleScenarios.memberSignsIn,
      isAdmin: false,
    },
    {
      // Um erro não pode tirar a Ana da tela de e-mails permitidos.
      description: 'the admin',
      inTheList: allowedEmailQueryScenarios.adminInList,
      signIn: signInWithFakeGoogleScenarios.adminSignsIn,
      isAdmin: true,
    },
  ])(
    'Should keep $description in the app when the e-mail read fails after access',
    async ({ inTheList, signIn, isAdmin }) => {
      jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signIn));
      const { result } = await renderHook(() => useAccess());
      await deliverEntryOf(inTheList);
      expect(result.current).toEqual({ status: 'allowed', isAdmin });

      await failTheRead();

      expect(result.current).toEqual({ status: 'allowed', isAdmin });
    },
  );

  it('Should stay loading when the first e-mail read fails', async () => {
    const { result } = await renderHook(() => useAccess());

    await failTheRead();

    expect(result.current.status).toBe('loading');
  });

  it('Should send to the no-access screen after 30 s of failed first reads', async () => {
    const { result } = await renderHook(() => useAccess());
    await failTheRead();

    await act(async () => jest.advanceTimersByTime(29999));
    expect(result.current.status).toBe('loading');

    await act(async () => jest.advanceTimersByTime(1));
    expect(result.current).toEqual({ status: 'denied', isAdmin: false });
  });

  it('Should never give up on a decided access', async () => {
    const { result } = await renderHook(() => useAccess());
    await deliverEntryOf(memberInTheList);
    await failTheRead();

    await act(async () => jest.advanceTimersByTime(60000));

    expect(result.current.status).toBe('allowed');
  });

  it('Should decide again when the retry succeeds', async () => {
    const { result } = await renderHook(() => useAccess());
    await failTheRead();
    expect(result.current.status).toBe('loading');

    await act(async () => jest.advanceTimersByTime(2000));
    await deliverEntryOf(memberInTheList);

    expect(result.current.status).toBe('allowed');
  });

  it('Should still deny when the e-mail leaves the list', async () => {
    const { result } = await renderHook(() => useAccess());
    await deliverEntryOf(memberInTheList);
    expect(result.current.status).toBe('allowed');

    await act(async () => deliver(documentSnapshot(memberRemoved.signedInAs, entryAfterRemoval)));

    expect(result.current.status).toBe('denied');
  });

  it('Should wait for the new read after signing out and in again', async () => {
    const { result, rerender } = await renderDeniedAccess();
    expect(result.current.status).toBe('denied');

    jest.mocked(useAuthState).mockReturnValue({ status: 'signedOut' });
    await rerender({});
    expect(result.current.status).toBe('signedOut');

    // O e-mail é o mesmo, então o `useRealtime` devolve o erro de antes até a nova escuta responder.
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
    await rerender({});
    expect(result.current.status).toBe('loading');

    await failTheRead();
    await act(async () => jest.advanceTimersByTime(29999));
    expect(result.current.status).toBe('loading');
    await act(async () => jest.advanceTimersByTime(1));
    expect(result.current).toEqual({ status: 'denied', isAdmin: false });
  });

  it('Should let the person in when the read after signing in again succeeds', async () => {
    const { result, rerender } = await renderDeniedAccess();

    jest.mocked(useAuthState).mockReturnValue({ status: 'signedOut' });
    await rerender({});
    jest.mocked(useAuthState).mockReturnValue(signedInAuthState(signInWithFakeGoogleScenarios.memberSignsIn));
    await rerender({});
    await deliverEntryOf(memberInTheList);

    expect(result.current).toEqual({ status: 'allowed', isAdmin: false });
  });

  it('Should sign out to the sign-in screen even after an error', async () => {
    const { result, rerender } = await renderHook(() => useAccess());
    await deliverEntryOf(memberInTheList);
    await failTheRead();

    jest.mocked(useAuthState).mockReturnValue({ status: 'signedOut' });
    await rerender({});

    expect(result.current.status).toBe('signedOut');
  });
});
