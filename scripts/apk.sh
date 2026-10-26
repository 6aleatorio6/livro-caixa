#!/usr/bin/env bash
# O `pnpm apk`, no PC: gera o APK de release, com o JavaScript embutido, que instala e abre sem o Metro, e o copia
# para `apps/mobile/release/livro-caixa-<versão>.apk`. Aponta para o Firebase de verdade: a variável dos emuladores
# sai do ambiente. O prebuild só aplica o `app.config.ts` à pasta `android` (fora do Git) e não a apaga. Assina com
# a chave de `release/`, cuja senha vem do `RELEASE_KEYSTORE_PASSWORD` do `.env`.
set -euo pipefail

cd "$(dirname "$0")/../apps/mobile"
unset EXPO_PUBLIC_USE_FIREBASE_EMULATOR

KEYSTORE=release/livro-caixa.keystore
RELEASE_KEYSTORE_PASSWORD=$(sed -n 's/^RELEASE_KEYSTORE_PASSWORD=//p' .env 2>/dev/null || true)
if [ ! -f "$KEYSTORE" ] || [ -z "$RELEASE_KEYSTORE_PASSWORD" ]; then
  echo "Falta a chave de release: apps/mobile/$KEYSTORE e o RELEASE_KEYSTORE_PASSWORD no apps/mobile/.env." >&2
  exit 1
fi
export RELEASE_KEYSTORE_PASSWORD

npx expo prebuild --platform android --no-install
(cd android && ./gradlew assembleRelease)

APK="release/livro-caixa-$(node -p "require('./package.json').version").apk"
cp android/app/build/outputs/apk/release/app-release.apk "$APK"
echo "APK: $(pwd)/$APK"
