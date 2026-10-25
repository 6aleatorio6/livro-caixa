// Com `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`, o app fala com os emuladores do Firebase no PC, e
// não com o projeto real. O emulador do Android alcança o PC em 10.0.2.2.
export const EMULATOR_HOST =
  process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
    ? (process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ?? '10.0.2.2')
    : null;
