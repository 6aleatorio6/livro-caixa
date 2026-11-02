// Com `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=true`, o app fala com os emuladores do Firebase no PC, e
// não com o projeto real. O aparelho chega ao PC pelo próprio 127.0.0.1, que o `adb reverse` das portas dos
// emuladores leva até lá: o mesmo caminho no emulador do Android, no redroid e num celular. O
// `android_bypass_emulator_url_remap` do `firebase.json` do app impede o React Native Firebase de trocar esse
// endereço pelo 10.0.2.2, que só o emulador do Android conhece.
export const EMULATOR_HOST =
  process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
    ? (process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ?? '127.0.0.1')
    : null;
