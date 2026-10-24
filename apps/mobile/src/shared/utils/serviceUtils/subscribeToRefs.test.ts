import { onSnapshot } from '@react-native-firebase/firestore';

import type { IRealtimeRef } from '@/shared/types/realtime/RealtimeRef';
import { subscribeToRefs } from './subscribeToRefs';

jest.mock('@react-native-firebase/firestore', () => ({ onSnapshot: jest.fn() }));

type ISnapshotListener = (snapshot: unknown) => void;

const listenersByPath = new Map<string, ISnapshotListener>();
const unsubscribe = jest.fn();

function documentSnapshot(id: string, data: object | null, isFromCache = false) {
  return { id, exists: () => data !== null, data: () => data, metadata: { fromCache: isFromCache } };
}

beforeEach(() => {
  jest.clearAllMocks();
  listenersByPath.clear();
  (onSnapshot as jest.Mock).mockImplementation((ref: { path: string }, _options, onNext: ISnapshotListener) => {
    listenersByPath.set(ref.path, onNext);
    return unsubscribe;
  });
});

const billRef = { path: 'recurringBills/aluguel' } as unknown as IRealtimeRef;
const tagRef = { path: 'settings/tags' } as unknown as IRealtimeRef;

describe('subscribeToRefs', () => {
  it('Should wait until every ref has answered before delivering', () => {
    const onData = jest.fn();
    subscribeToRefs([billRef, tagRef], onData, jest.fn());

    listenersByPath.get('recurringBills/aluguel')!(documentSnapshot('aluguel', { name: 'Aluguel' }));
    expect(onData).not.toHaveBeenCalled();

    listenersByPath.get('settings/tags')!(documentSnapshot('tags', { items: {} }));
    expect(onData).toHaveBeenCalledWith(
      [
        { id: 'aluguel', name: 'Aluguel' },
        { id: 'tags', items: {} },
      ],
      false,
    );
  });

  it('Should deliver again when any ref changes, saying when something came from the cache', () => {
    const onData = jest.fn();
    subscribeToRefs([billRef, tagRef], onData, jest.fn());
    listenersByPath.get('recurringBills/aluguel')!(documentSnapshot('aluguel', { name: 'Aluguel' }));
    listenersByPath.get('settings/tags')!(documentSnapshot('tags', { items: {} }));

    listenersByPath.get('recurringBills/aluguel')!(documentSnapshot('aluguel', { name: 'Aluguel e condomínio' }, true));

    expect(onData).toHaveBeenLastCalledWith(
      [
        { id: 'aluguel', name: 'Aluguel e condomínio' },
        { id: 'tags', items: {} },
      ],
      true,
    );
  });

  it('Should deliver null for a document that does not exist', () => {
    const onData = jest.fn();
    subscribeToRefs([billRef], onData, jest.fn());

    listenersByPath.get('recurringBills/aluguel')!(documentSnapshot('aluguel', null));

    expect(onData).toHaveBeenCalledWith([null], false);
  });

  it('Should stop listening to every ref when unsubscribed', () => {
    const stop = subscribeToRefs([billRef, tagRef], jest.fn(), jest.fn());

    stop();

    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });
});
