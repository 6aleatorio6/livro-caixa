#!/usr/bin/env bash
# O `pnpm apk`, no PC: gera o APK de release, com o JavaScript embutido, que instala e abre sem o Metro.
# Aponta para o Firebase de verdade: a variável dos emuladores sai do ambiente. O prebuild só aplica o
# `app.config.ts` à pasta `android` (fora do Git) e não a apaga. A assinatura é a de debug do modelo do
# Expo: serve para instalar no celular da família, não para publicar na loja.
set -euo pipefail

cd "$(dirname "$0")/../apps/mobile"
unset EXPO_PUBLIC_USE_FIREBASE_EMULATOR

npx expo prebuild --platform android --no-install
(cd android && ./gradlew assembleRelease)

echo "APK: $(pwd)/android/app/build/outputs/apk/release/app-release.apk"
