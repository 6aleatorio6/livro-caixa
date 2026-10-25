import { renderHook } from '@testing-library/react-native';
import { object, string } from 'yup';

import { createFormHook } from './createFormHook';

const useNameForm = createFormHook(object({ name: string().required() }), { name: '' });

describe('createFormHook', () => {
  it('Should start the form with the values given to the factory', async () => {
    const { result } = await renderHook(() => useNameForm());

    expect(result.current.getValues()).toEqual({ name: '' });
  });

  it('Should start the form with the values given to the call instead of the factory ones', async () => {
    const { result } = await renderHook(() => useNameForm(undefined, { name: 'Bruno Souza' }));

    expect(result.current.getValues()).toEqual({ name: 'Bruno Souza' });
  });
});
