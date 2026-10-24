#!/usr/bin/env bash
# O `pnpm android`, no PC: liga o desenho dos apps no emulador e segue para o build. A imagem ATD da
# AVD (`google_atd`) o desliga a cada boot, e o app abriria com a tela preta. A propriedade vale para
# o app aberto depois dela, então vem antes do build. Com o emulador fechado, só avisa: o build segue.
set -euo pipefail

adb shell setprop debug.hwui.drawing_enabled 1 > /dev/null 2>&1 ||
  echo "Desenho dos apps não ligado: o emulador está aberto? Depois, \`adb shell setprop debug.hwui.drawing_enabled 1\` e reabra o app." >&2
exec pnpm mobile android "$@"
