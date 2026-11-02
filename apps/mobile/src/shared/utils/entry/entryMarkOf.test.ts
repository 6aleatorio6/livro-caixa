import { Check, HandCoins, Receipt, UsersRound } from 'lucide-react-native';

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

  it('Should mark a bill paid only by contributions with the people on the primary container', () => {
    expect(entryMarkOf('paidByContributions')).toEqual({
      icon: UsersRound,
      markColor: 'primaryContainer',
      iconColor: 'onPrimaryContainer',
    });
  });

  it('Should mark a contribution with the coins in hand on the primary container', () => {
    expect(entryMarkOf('contribution')).toEqual({
      icon: HandCoins,
      markColor: 'primaryContainer',
      iconColor: 'onPrimaryContainer',
    });
  });
});
