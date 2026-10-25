import { redirectSystemPath } from '@/app/+native-intent';

describe('redirectSystemPath', () => {
  it.each(['livrocaixa://expo-sharing', 'livrocaixa://expo-sharing/', '/expo-sharing', 'livrocaixa:///expo-sharing?x=1'])(
    'Should take the sharing address %s to the share-receipt screen',
    (path) => {
      expect(redirectSystemPath({ path })).toBe('/share-receipt');
    },
  );

  it.each(['/tags', 'livrocaixa://tags', '/expo-sharing-other', 'livrocaixa://sign-in'])(
    'Should leave %s as it is',
    (path) => {
      expect(redirectSystemPath({ path })).toBe(path);
    },
  );
});
