import { Check, Receipt } from 'lucide-react-native';

import { entryMarkOf } from './entryMarkOf';

describe('entryMarkOf', () => {
  it('Should mark a payment with the check on the primary container', () => {
    expect(entryMarkOf('payment')).toEqual({
      icon: Check,
      markColor: 'primaryContainer',
      iconColor: 'onPrimaryContainer',
    });
  });

  it('Should mark a one-off bill with the receipt on the secondary container', () => {
    expect(entryMarkOf('oneOff')).toEqual({
      icon: Receipt,
      markColor: 'secondaryContainer',
      iconColor: 'onSecondaryContainer',
    });
  });
});
