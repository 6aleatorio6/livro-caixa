#!/usr/bin/env bash
# O `pnpm android`, no PC: liga o desenho dos apps no emulador e segue para o build. A imagem ATD da
# AVD (`google_atd`) o desliga a cada boot, e o app abriria com a tela preta. A propriedade vale para
# o app aberto depois dela, então vem antes do build. Com o emulador fechado, só avisa: o build segue.
# Também leva as portas dos emuladores do Firebase (Auth na 9099, Firestore na 8080) do 127.0.0.1 do aparelho ao PC,
# onde o app as procura; a do Metro, o build já leva. Com mais de um aparelho, o `ANDROID_SERIAL` escolhe qual.
set -euo pipefail

adb shell setprop debug.hwui.drawing_enabled 1 > /dev/null 2>&1 ||
  echo "Desenho dos apps não ligado: o emulador está aberto? Depois, \`adb shell setprop debug.hwui.drawing_enabled 1\` e reabra o app." >&2
for port in 9099 8080; do
  adb reverse "tcp:$port" "tcp:$port" > /dev/null 2>&1 || echo "A porta $port não foi levada ao PC: o aparelho está conectado?" >&2
done
exec pnpm mobile android "$@"
